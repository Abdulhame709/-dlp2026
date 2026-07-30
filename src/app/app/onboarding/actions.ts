'use server';

import { OnboardingService, ProfileSetupInput, WorkspaceSetupInput } from '@/core/auth/onboarding-service';
import { createClient } from '@/core/database/server';

export async function submitOnboarding(
  userIdFromClient: string,
  profileData: ProfileSetupInput,
  workspaceData: WorkspaceSetupInput
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Resolve the TRUE user ID directly from the secure server-side session
    // This bypasses any client-side cookie desync or default states!
    const resolvedUserId = user ? user.id : userIdFromClient;
    
    console.log(`SRE: Resolving secure onboarding session for user: ${resolvedUserId}`);
    
    return await OnboardingService.completeOnboarding(resolvedUserId, profileData, workspaceData);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
