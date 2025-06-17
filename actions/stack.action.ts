'use server';

import { Database } from 'types_db';
import { createServerSupabaseClient } from 'utils/supabase/server';

export type StackRow = Database['public']['Tables']['stack']['Row'];
export type StackRowInsert =
  Database['public']['Tables']['stack']['Insert'];

const handleError = (error) => {
  console.error(error);
  throw new Error(error.message);
};

export async function getStacks(): Promise<StackRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('stack')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    handleError(error);
  }

  return data;
}
