import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
  @Column('uuid')
  role_id: string;

  @Column('uuid')
  permission_id: string;

  @ManyToOne(() => Role, role => role.permissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}