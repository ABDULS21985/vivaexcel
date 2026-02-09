import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { dataSourceOptions } from './data-source';
import * as Entities from '../entities';
import { seedUsers } from './seeds/user.seed';

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
        entities: Object.values(Entities).filter(e => typeof e === 'function'),
        synchronize: true,
    } as any);

    try {
        await dataSource.initialize();
        console.log('Database connection established.');

        // Run user seed
        await seedUsers(dataSource);

        // Add other seeds here if needed

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
