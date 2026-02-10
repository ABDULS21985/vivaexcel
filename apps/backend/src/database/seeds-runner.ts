import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { dataSourceOptions } from './data-source';
import * as Entities from '../entities';
import { seedUsers } from './seeds/user.seed';
import { seedBlog } from './seeds/blog.seed';
import { User } from '../entities/user.entity';
import { BlogPost } from '../modules/blog/entities/blog-post.entity';
import { BlogCategory } from '../modules/blog/entities/blog-category.entity';
import { BlogTag } from '../modules/blog/entities/blog-tag.entity';

dotenv.config({ path: '../../.env' });

async function runSeeds() {
    console.log('Starting database seeding...');

    const dataSource = new DataSource({
        ...dataSourceOptions,
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || 'ktblog',
        password: process.env.POSTGRES_PASSWORD || 'ktblog123',
        database: process.env.POSTGRES_DB || 'ktblog',
        entities: [
            ...Object.values(Entities).filter(e => typeof e === 'function'),
            BlogPost,
            BlogCategory,
            BlogTag,
        ],
        synchronize: true,
    } as any);

    try {
        await dataSource.initialize();
        console.log('Database connection established.');

        // Run user seed
        await seedUsers(dataSource);

        // Run blog seed using the admin user as author
        const userRepository = dataSource.getRepository(User);
        const adminUser = await userRepository.findOne({
            where: { email: 'admin@drkatangablog.com' },
        });
        if (adminUser) {
            await seedBlog(dataSource, adminUser.id);
        } else {
            console.log('Skipping blog seed: admin user not found');
        }

        console.log('All seeds completed successfully.');
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

runSeeds();
