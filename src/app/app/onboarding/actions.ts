'use server';

import { OnboardingService, ProfileSetupInput, WorkspaceSetupInput } from '@/core/auth/onboarding-service';

export async function submitOnboarding(
  userId: string,
  profileData: ProfileSetupInput,
  workspaceData: WorkspaceSetupInput
) {
  try {
    return await OnboardingService.completeOnboarding(userId, profileData, workspaceData);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
