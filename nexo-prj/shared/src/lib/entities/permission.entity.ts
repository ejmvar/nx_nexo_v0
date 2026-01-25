import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RolePermission } from './role-permission.entity';
import { AccountPermission } from './account-permission.entity';
import { DelegationPermission } from './delegation-permission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  resource: string;

  @Column()
  action: string;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];

  @OneToMany(() => AccountPermission, accountPermission => accountPermission.permission)
  accountPermissions: AccountPermission[];

  @OneToMany(() => DelegationPermission, delegationPermission => delegationPermission.permission)
  delegationPermissions: DelegationPermission[];
}