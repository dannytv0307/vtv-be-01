import 'dotenv/config';
import { runSeeder, Seeder } from 'typeorm-extension';
import { SeedsDataSource } from '../src/database/data-source.seeds';
import SeedAdminUser1004 from '../src/database/seeds/1004-seed-admin-user';

async function runSeeds() {
  try {
    await SeedsDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run the admin user seeder
    await runSeeder(SeedsDataSource, SeedAdminUser1004);
    console.log('Admin user seed has been executed successfully!');

    await SeedsDataSource.destroy();
    console.log('Data Source has been destroyed!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeeds();
