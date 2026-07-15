import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmobvfdlmcmwoydpfrld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtb2J2ZmRsbWNtd295ZHBmcmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDM3NDYsImV4cCI6MjA3NTcxOTc0Nn0.ZLN8Ukq2AbqX5It6wEK3ieoL7PNHhgMCtRzv9-vjHlM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectOrders() {
  console.log('Fetching latest orders...');
  const { data, error } = await supabase
    .from('orders')
    .select('order_number, created_at, source, status')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Latest orders in DB:', data);
  }
}

inspectOrders();
