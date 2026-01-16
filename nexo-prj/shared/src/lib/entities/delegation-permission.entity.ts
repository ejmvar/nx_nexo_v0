import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Delegation } from './delegation.entity';
import { Permission } from './permission.entity';

@Entity('delegation_permissions')
export class DelegationPermission extends BaseEntity {
  @Column('uuid')
  delegation_id: string;

  @Column('uuid')
  permission_id: string;

  @ManyToOne(() => Delegation, delegation => delegation.permissions)
  @JoinColumn({ name: 'delegation_id' })
  delegation: Delegation;

  @ManyToOne(() => Permission, permission => permission.delegationPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}