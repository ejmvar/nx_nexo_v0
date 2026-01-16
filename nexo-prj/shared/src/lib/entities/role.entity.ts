import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AccountRoleAssignment } from './account-role-assignment.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => AccountRoleAssignment, assignment => assignment.role)
  assignments: AccountRoleAssignment[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  permissions: RolePermission[];
}