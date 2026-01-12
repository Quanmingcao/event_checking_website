import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqzdgearcsqoxikkbfeo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxemRnZWFyY3Nxb3hpa2tiZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjI1NzUsImV4cCI6MjA4MzMzODU3NX0.OcBZUOue5YpeEMieG1c8ORoMKe-9HiH8uqTO6QFTWF0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
