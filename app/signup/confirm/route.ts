import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from 'utils/supabase/server';

// 처음엔, localhost:3000/signup/confirm?code=....
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // localhost:3000으로 리다이렉트
  return NextResponse.redirect(requestUrl.origin);
}
