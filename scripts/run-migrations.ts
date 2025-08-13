import 'dotenv/config';
import { AppDataSource } from '../src/database/data-source';

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    await AppDataSource.runMigrations();
    console.log('Migrations have been executed successfully!');

    await AppDataSource.destroy();
    console.log('Data Source has been destroyed!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

runMigrations();
