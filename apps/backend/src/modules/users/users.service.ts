import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { User } from '../../entities/user.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';
import { Role } from '../../common/constants/roles.constant';
import { UserStatus } from '../../entities/user.entity';


@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async findAll(query: UserQueryDto): Promise<ApiResponse<PaginatedResponse<User>>> {
    const result = await this.usersRepository.findAll(query);
    return {
      status: 'success',
      message: 'Users retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByIdWithResponse(id: string): Promise<ApiResponse<User>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return {
      status: 'success',
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(createUserDto.password);

    // Create user
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: createUserDto.roles || [Role.VIEWER],
    });

    return {
      status: 'success',
      message: 'User created successfully',
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
    // Check if user exists
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // If updating email, check if new email already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findByEmail(updateUserDto.email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    const updateData: Partial<User> = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await argon2.hash(updateUserDto.password);
    }

    // If email is being verified, set verification timestamp
    if (updateUserDto.emailVerified && !existingUser.emailVerified) {
      updateData.emailVerifiedAt = new Date();
    }

    const updatedUser = await this.usersRepository.update(id, updateData);

    return {
      status: 'success',
      message: 'User updated successfully',
      data: updatedUser!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    await this.usersRepository.softDelete(id);

    return {
      status: 'success',
      message: 'User deleted successfully',
      data: null,
    };
  }

  async restore(id: string): Promise<ApiResponse<User>> {
    const restored = await this.usersRepository.restore(id);
    if (!restored) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const user = await this.usersRepository.findById(id);

    return {
      status: 'success',
      message: 'User restored successfully',
      data: user!,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }

    if (!user.password) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { metadata: { googleId } } as any });
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { metadata: { githubId } } as any });
  }

  async createFromOAuth(data: {
    email: string;
    name: string;
    emailVerified: boolean;
    googleId?: string;
    githubId?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const names = data.name.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';

    const user = await this.usersRepository.create({
      email: data.email,
      firstName,
      lastName,
      emailVerified: data.emailVerified,
      avatar: data.avatarUrl,
      password: await argon2.hash(Math.random().toString(36).slice(-16)), // Random password for OAuth users
      status: UserStatus.ACTIVE,
      metadata: {
        googleId: data.googleId,
        githubId: data.githubId,
      },
    } as any);

    return user;
  }

  async createRaw(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    return this.usersRepository.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      status: UserStatus.ACTIVE,
    } as any);
  }

  async updateRaw(id: string, data: Partial<User>): Promise<User> {
    const updated = await this.usersRepository.update(id, data);
    return updated!;
  }
}
