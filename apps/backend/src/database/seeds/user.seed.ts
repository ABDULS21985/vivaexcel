import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserStatus } from '../../entities/user.entity';
import { Role } from '../../common/constants/roles.constant';

/**
 * Seeds a default admin user for the dashboard.
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const adminEmail = 'admin@drkatangablog.com';
    const existingUser = await userRepository.findOne({
        where: { email: adminEmail },
    });

    if (!existingUser) {
        console.log('Seeding default admin user...');

        const hashedPassword = await argon2.hash('Admin@123456');

        const admin = userRepository.create({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            status: UserStatus.ACTIVE,
            roles: [Role.ADMIN, Role.SUPER_ADMIN],
            emailVerified: true,
            metadata: {
                isSeed: true,
            },
        });

        await userRepository.save(admin);
        console.log(`Created admin user: ${adminEmail}`);
    } else {
        console.log(`Admin user already exists: ${adminEmail}`);
    }

    console.log('User seeding completed!');
}
