import { createBrowserClient } from '@supabase/ssr';
import { env } from '../config/env';

export const createClient = () =>
  createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
