import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'ktblog'),
        password: configService.get<string>('DB_PASSWORD', 'ktblog123'),
        database: configService.get<string>('DB_NAME', 'ktblog'),

        // Connection pooling
        poolSize: 20,
        extra: {
          min: 5,
          max: 20,
          statement_timeout: 30000,
          query_timeout: 30000,
        },

        // Auto-load entities
        autoLoadEntities: true,

        // Entity and migration paths
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/database/migrations/*.js'],

        // Synchronize should be false in production
        synchronize: configService.get<string>('NODE_ENV') === 'development',

        // Logging configuration
        logging:
          configService.get<string>('NODE_ENV') === 'development'
            ? ['query', 'error']
            : ['error'],

        // SSL configuration
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }
