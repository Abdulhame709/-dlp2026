import { z } from 'zod';

// Password criteria: min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' });

// Sign Up Input Schema
export const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters long.' })
    .max(100, { message: 'Full name cannot exceed 100 characters.' }),
});

// Login Input Schema
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// Forgot Password Input Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

// Update Password Input Schema
export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

// User Profile Setup Schema (Phase 1B-B)
export const profileSetupSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters long.' })
    .max(100),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  language: z.string().min(2).max(10),
  timezone: z.string().min(1).max(100),
  theme: z.enum(['light', 'dark', 'system']),
  dateFormat: z.string().min(1),
  timeFormat: z.string().min(1),
});

// Workspace Wizard Setup Schema (Phase 1B-B)
export const workspaceSetupSchema = z.object({
  name: z.string().min(2, { message: 'Workspace name must be at least 2 characters.' }).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['PERSONAL', 'TEAM', 'ORGANIZATION']),
});

// Organization Setup Schema (Phase 1B-B)
export const organizationSetupSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain lowercase letters, numbers, and hyphens only.',
  }),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

// Invitation Schema (Phase 1B-B)
export const inviteSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
export type WorkspaceSetupInput = z.infer<typeof workspaceSetupSchema>;
export type OrganizationSetupInput = z.infer<typeof organizationSetupSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
