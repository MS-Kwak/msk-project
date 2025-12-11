// actions/contact.action.ts
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

export async function getContactsByName(
  name: string
): Promise<ContactRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('contact')
    .select('*')
    .eq('name', name) // 이름과 정확히 일치하는 문의 내역 검색
    .order('created_at', { ascending: true });

  if (error) {
    handleError(error);
  }

  return data || []; // 데이터가 없을 경우 빈 배열 반환
}

// 모든 연락처 이름을 가져오는 함수 추가
export async function getAllContactNames(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('contact')
    .select('name') // 이름만 선택
    .order('name', { ascending: true }); // 이름으로 정렬

  if (error) {
    handleError(error);
  }

  // 중복된 이름을 제거하고 이름 배열로 변환
  const names = data?.map((item) => item.name) || [];
  const uniqueNames = names.filter(
    (name, index) => names.indexOf(name) === index
  );
  return uniqueNames;
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
