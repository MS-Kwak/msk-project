import { createServerSupabaseClient } from '@/utils/supabase/server';
import AuthProvider from '@/config/AuthProvider';
import AdminPage from '@/app/admin/page';
import SignIn from '@/components/auth/signin';

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  console.log('session', session, error);

  return (
    <AuthProvider accessToken={session?.access_token}>
      {session?.user ? <AdminPage /> : <SignIn />}
    </AuthProvider>
  );
}
