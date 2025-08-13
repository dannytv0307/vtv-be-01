import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User, AuthProvider } from '../../users/entities/user.entity';
import { Role, RoleType } from '../../users/entities/role.entity';
import * as crypto from 'crypto';

export default class SeedAdminUser1004 implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Ensure roles exist
    const ensureRole = async (type: RoleType, name: string, description: string) => {
      let role = await roleRepository.findOne({ where: { type } });
      if (!role) {
        role = roleRepository.create({ type, name, description });
        role = await roleRepository.save(role);
      }
      return role;
    };

    const adminRole = await ensureRole(
      RoleType.Admin,
      'Administrator',
      'System administrator with full access',
    );
    await ensureRole(RoleType.User, 'User', 'Regular user with basic access');
    await ensureRole(RoleType.Moderator, 'Moderator', 'Moderator with limited administrative access');

    // Create admin user if it doesn't exist
    let adminUser = await userRepository.findOne({ where: { email: 'admin@vtv.com' } });
    if (!adminUser) {
      const passwordHash = crypto
        .createHmac('sha256', process.env.PASSWORD_HASH_KEY || 'default-key')
        .update('admin123')
        .digest('hex');

      adminUser = userRepository.create({
        email: 'admin@vtv.com',
        passwordHash,
        displayName: 'System Administrator',
        provider: AuthProvider.Local,
        roleId: adminRole.id,
      });
      await userRepository.save(adminUser);
    } else if (!adminUser.roleId) {
      adminUser.roleId = adminRole.id;
      await userRepository.save(adminUser);
    }
  }
}
