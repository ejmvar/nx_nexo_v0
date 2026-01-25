import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { UserAccount } from './entities/user-account.entity';
import { Role } from './entities/role.entity';
import { AccountRoleAssignment } from './entities/account-role-assignment.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { AccountPermission } from './entities/account-permission.entity';
import { Delegation } from './entities/delegation.entity';
import { DelegationPermission } from './entities/delegation-permission.entity';
import { AuditLog } from './entities/audit-log.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'nexo_user',
  password: process.env.DB_PASSWORD || 'nexo_password',
  database: process.env.DB_NAME || 'nexo',
  synchronize: false, // Use migrations
  logging: true,
  entities: [
    User,
    Account,
    UserAccount,
    Role,
    AccountRoleAssignment,
    Permission,
    RolePermission,
    AccountPermission,
    Delegation,
    DelegationPermission,
    AuditLog,
  ],
  migrations: ['dist/apps/**/migrations/*.js'], // Adjust path
});