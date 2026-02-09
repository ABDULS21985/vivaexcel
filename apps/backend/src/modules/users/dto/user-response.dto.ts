import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '../../../common/constants/roles.constant';
import { UserStatus } from '../../../entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiPropertyOptional()
  avatar?: string;

  @Expose()
  @ApiPropertyOptional()
  phone?: string;

  @Expose()
  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @Expose()
  @ApiProperty({ type: [String], enum: Role })
  roles: Role[];

  @Expose()
  @ApiPropertyOptional({ type: [String] })
  permissions?: string[];

  @Expose()
  @ApiProperty()
  emailVerified: boolean;

  @Expose()
  @ApiPropertyOptional()
  emailVerifiedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  @Type(() => UserResponseDto)
  items: UserResponseDto[];

  @ApiProperty()
  meta: {
    total?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}
