'use client';

import { createBrowserSupabaseClient } from '@/utils/supabase/client';
import { Input } from '@material-tailwind/react';
import { Button } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import style from './signin.module.css'; // Assuming you have a CSS module for styling

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createBrowserSupabaseClient();

  const signInMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data) {
        console.log(data);
        // 어차피 화면이 넘어갈꺼기 때문에 어떤 처리를 해줄 필요가 없어요!!
      }

      if (error) {
        alert(error.message);
      }
    },
  });

  return (
    <div className={style.SignIn}>
      <div className={style.SignIn__inner}>
        <h1 className={style.title}>관리자 로그인</h1>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          type="email"
          className={`${style.input} ${style.email}`}
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className={`${style.input} ${style.password}`}
        />
        <Button
          onClick={() => {
            signInMutation.mutate();
          }}
          loading={signInMutation.isPending}
          disabled={signInMutation.isPending}
          className={style.loginButton}
        >
          로그인
        </Button>
      </div>
    </div>
  );
}
