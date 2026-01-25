import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Account } from './account.entity';
import { Permission } from './permission.entity';

@Entity('account_permissions')
export class AccountPermission extends BaseEntity {
  @Column('uuid')
  account_id: string;

  @Column('uuid')
  permission_id: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => Account, account => account.permissions)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Permission, permission => permission.accountPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}