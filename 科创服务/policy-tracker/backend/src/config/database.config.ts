import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User, Enterprise, Policy, ApplicationTask } from '../entities';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'policy_tracker',
  entities: [User, Enterprise, Policy, ApplicationTask],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
};

export default registerAs('database', () => typeOrmConfig);

export const connectionSource = new DataSource({
  ...(typeOrmConfig as DataSourceOptions),
  migrations: ['src/migrations/*.ts'],
});