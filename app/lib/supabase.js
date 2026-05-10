import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://iohefqqqpjydtjjnxcmg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaGVmcXFxcGp5ZHRqam54Y21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjU1ODEsImV4cCI6MjA5Mzk0MTU4MX0.N6UNziusCwxc6rj3zQxiezctWAlGwI4_N5yIrT5SKxY',
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true,
    },
  }
);