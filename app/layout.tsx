import type { Metadata } from 'next';
import './globals.css';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';

export const metadata: Metadata = {
  title: `Ethan's Dev Projects`,
  description:
    'Welcome to my development projects portfolio. Here you can find various projects I have worked on, showcasing my skills and creativity in web development.',
};

export default function RootLayout({ children }) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ReactQueryClientProvider>
  );
}
