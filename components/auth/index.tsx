'use client';

import { useState } from 'react';
import SignIn from './signin';
import style from './index.module.css'; // Assuming you have a CSS module for styling

export default function Auth() {
  return (
    <main className={style.Auth}>
      <SignIn />
    </main>
  );
}
