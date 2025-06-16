'use server';

import { Database } from 'types_db';
import { createServerSupabaseClient } from 'utils/supabase/server';

export type ContactRow =
  Database['public']['Tables']['contact']['Row'];
export type ContactRowInsert =
  Database['public']['Tables']['contact']['Insert'];

const handleError = (error) => {
  console.error(error);
  throw new Error(error.message);
};

export async function getContacts(): Promise<ContactRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    handleError(error);
  }

  return data;
}

export async function createContact(input: ContactRowInsert) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.from('contact').insert({
    ...input,
    created_at: new Date().toISOString(),
  });

  if (error) {
    handleError(error);
  }

  return data;
}
