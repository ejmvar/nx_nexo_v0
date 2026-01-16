import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRoleAssignment, RolePermission, AccountPermission, DelegationPermission } from '@nexo-prj/shared';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(AccountRoleAssignment)
    private assignmentRepo: Repository<AccountRoleAssignment>,
    @InjectRepository(RolePermission)
    private rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(AccountPermission)
    private accountPermissionRepo: Repository<AccountPermission>,
    @InjectRepository(DelegationPermission)
    private delegationPermissionRepo: Repository<DelegationPermission>,
  ) {}

  async hasPermission(accountId: string, resource: string, action: string, context?: any): Promise<boolean> {
    // Check direct account permissions
    const directPerm = await this.accountPermissionRepo.findOne({
      where: {
        account_id: accountId,
        permission: { resource, action },
      },
    });
    if (directPerm) return true;

    // Check role permissions
    const assignments = await this.assignmentRepo.find({
      where: { account_id: accountId },
      relations: ['role', 'role.permissions', 'role.permissions.permission'],
    });

    for (const assignment of assignments) {
      const hasRolePerm = assignment.role.permissions.some(rp => rp.permission.resource === resource && rp.permission.action === action);
      if (hasRolePerm) return true;
    }

    // Check delegations
    const delegations = await this.delegationPermissionRepo.find({
      where: { delegation: { to_account_id: accountId } },
      relations: ['permission'],
    });

    const hasDelegatedPerm = delegations.some(dp => dp.permission.resource === resource && dp.permission.action === action);
    if (hasDelegatedPerm) return true;

    return false;
  }
}