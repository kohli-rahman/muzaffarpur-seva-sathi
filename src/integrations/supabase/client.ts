// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jrnlegccgugofvnovqey.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybmxlZ2NjZ3Vnb2Z2bm92cWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MTk5ODMsImV4cCI6MjA2Mzk5NTk4M30.uqyGnVKOsHHbwmUHtW79cbYnqPZ2pHsX1zz3PjI2Hfo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);