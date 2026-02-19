import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

let supabaseInstance: any = null;

export function createClient() {
  if (!supabaseInstance) {
    if (projectId && publicAnonKey) {
      supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey);
    } else {
      // Return mock client if credentials are not available
      supabaseInstance = createMockClient();
    }
  }
  return supabaseInstance;
}

function createMockClient() {
  return {
    from: (table: string) => ({
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          order: (orderColumn: string, options?: any) => 
            Promise.resolve({ data: [], error: null }),
        }),
        match: (filters: any) => 
          Promise.resolve({ data: [], error: null }),
      }),
      insert: (data: any) => 
        Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) => 
          Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => 
          Promise.resolve({ data: null, error: null }),
      }),
    }),
    auth: {
      signInWithPassword: (credentials: any) => 
        Promise.resolve({ data: null, error: null }),
      signUp: (credentials: any) => 
        Promise.resolve({ data: null, error: null }),
      signOut: () => 
        Promise.resolve({ error: null }),
    },
  };
}
