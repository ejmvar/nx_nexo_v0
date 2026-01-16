import { Entity, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Account } from './account.entity';
import { DelegationPermission } from './delegation-permission.entity';

@Entity('delegations')
export class Delegation extends BaseEntity {
  @Column('uuid')
  from_account_id: string;

  @Column('uuid')
  to_account_id: string;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date;

  @ManyToOne(() => Account, account => account.delegationsFrom)
  @JoinColumn({ name: 'from_account_id' })
  fromAccount: Account;

  @ManyToOne(() => Account, account => account.delegationsTo)
  @JoinColumn({ name: 'to_account_id' })
  toAccount: Account;

  @OneToMany(() => DelegationPermission, delegationPermission => delegationPermission.delegation)
  permissions: DelegationPermission[];
}