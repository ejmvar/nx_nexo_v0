import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Account } from './account.entity';
import { Role } from './role.entity';

@Entity('account_role_assignments')
export class AccountRoleAssignment extends BaseEntity {
  @Column('uuid')
  account_id: string;

  @Column('uuid')
  role_id: string;

  @Column('uuid', { nullable: true })
  related_account_id: string;

  @Column({ nullable: true })
  contract_id: string;

  @Column({ type: 'timestamp', nullable: true })
  valid_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date;

  @ManyToOne(() => Account, account => account.roleAssignments)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Role, role => role.assignments)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'related_account_id' })
  relatedAccount: Account;
}