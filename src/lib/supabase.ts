import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) throw new Error("Supabase env vars are missing");

export const supabase = createClient<Database>(url, anonKey);
