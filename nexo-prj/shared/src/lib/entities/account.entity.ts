import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserAccount } from './user-account.entity';
import { AccountRoleAssignment } from './account-role-assignment.entity';
import { AccountPermission } from './account-permission.entity';
import { Delegation } from './delegation.entity';

export enum AccountType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
  VEHICLE = 'VEHICLE',
  ASSET = 'ASSET',
}

@Entity('accounts')
export class Account extends BaseEntity {
  @Column({
    type: 'enum',
    enum: AccountType,
  })
  account_type: AccountType;

  @Column()
  display_name: string;

  @Column({ nullable: true })
  reference_type: string;

  @Column({ nullable: true })
  reference_id: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => UserAccount, userAccount => userAccount.account)
  userAccounts: UserAccount[];

  @OneToMany(() => AccountRoleAssignment, assignment => assignment.account)
  roleAssignments: AccountRoleAssignment[];

  @OneToMany(() => AccountPermission, permission => permission.account)
  permissions: AccountPermission[];

  @OneToMany(() => Delegation, delegation => delegation.fromAccount)
  delegationsFrom: Delegation[];

  @OneToMany(() => Delegation, delegation => delegation.toAccount)
  delegationsTo: Delegation[];
}