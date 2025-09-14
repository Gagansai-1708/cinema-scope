import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/auth-provider';
// import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'CinemaScope',
  description: 'The universe of cinema at your fingertips.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          {/* <Toaster /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
