// API Route 전용 Supabase Admin Client
// - cookies() 호출 없음 (카카오 등 외부 서비스에서 오는 요청에는 세션 쿠키가 없음)
// - service role key 사용 (RLS 우회, 모든 테이블 접근 가능)
// - 'use server' 없음 (API Route에서 직접 import 가능)

import { createClient } from '@supabase/supabase-js';
import { Database } from 'types_db';

export const createApiAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '[Supabase] 환경변수 누락: NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_SUPABASE_SERVICE_ROLE',
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
