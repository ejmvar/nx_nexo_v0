import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Account } from './account.entity';

@Entity('user_accounts')
export class UserAccount extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('uuid')
  account_id: string;

  @Column({ default: false })
  is_primary: boolean;

  @ManyToOne(() => User, user => user.userAccounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Account, account => account.userAccounts)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}