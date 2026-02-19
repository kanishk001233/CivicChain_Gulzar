// Supabase project configuration
// Add your Supabase project credentials here
import {
  projectId as generatedProjectId,
  publicAnonKey as generatedPublicAnonKey,
} from "./info.tsx";

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || generatedProjectId || "";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || generatedPublicAnonKey || "";
