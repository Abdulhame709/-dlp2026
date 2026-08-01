import { Logger } from '@/core/logging/logger';

export interface BetaInvitation {
  id: string;
  email: string;
  accessCode: string;
  isUsed: boolean;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  expiresAt: Date;
}

const mockBetaInvitations = new Map<string, BetaInvitation>([
  {
    id: 'invite-1',
    email: 'beta-pioneer@cortexai.com',
    accessCode: 'CORTEX_BETA_2026',
    isUsed: false,
    role: 'OWNER' as const,
    expiresAt: new Date(Date.now() + 86400000 * 30),
  }
].map(invite => [invite.accessCode, invite]));

export class BetaManager {
  /**
   * Validate if a specific beta access code is valid and unused
   */
  static validateAccessCode(accessCode: string, email: string): { isValid: boolean; error?: string } {
    const invite = mockBetaInvitations.get(accessCode);
    if (!invite) {
      return { isValid: false, error: 'INVALID_ACCESS_CODE: The code you provided does not exist.' };
    }

    if (invite.isUsed) {
      return { isValid: false, error: 'USED_ACCESS_CODE: This invite code has already been consumed.' };
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return { isValid: false, error: 'EMAIL_MISMATCH: This invite code is reserved for another email.' };
    }

    if (Date.now() > invite.expiresAt.getTime()) {
      return { isValid: false, error: 'EXPIRED_ACCESS_CODE: This invite has expired.' };
    }

    return { isValid: true };
  }

  /**
   * Consume a beta access code upon successful registration
   */
  static async consumeAccessCode(accessCode: string, email: string): Promise<boolean> {
    const check = this.validateAccessCode(accessCode, email);
    if (!check.isValid) return false;

    const invite = mockBetaInvitations.get(accessCode)!;
    invite.isUsed = true;
    mockBetaInvitations.set(accessCode, invite);

    await Logger.security('Beta Access Code Consumed', { email, accessCode, inviteId: invite.id });
    return true;
  }

  /**
   * Verify organization size and user caps for Pro and Free beta limits
   */
  static verifyTenantQuota(plan: 'FREE' | 'PRO' | 'ENTERPRISE', currentMemberCount: number): boolean {
    const planLimits = {
      FREE: 3,        // Max 3 users per workspace in Free Beta
      PRO: 20,       // Max 20 users in Pro Beta
      ENTERPRISE: 250 // Custom bounds for Enterprise
    };

    return currentMemberCount < planLimits[plan];
  }
}
