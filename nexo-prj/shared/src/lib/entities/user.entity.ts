import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserAccount } from './user-account.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  auth_provider_id: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => UserAccount, userAccount => userAccount.user)
  userAccounts: UserAccount[];
}