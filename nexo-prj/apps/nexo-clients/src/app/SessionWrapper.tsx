'use client';

import { SessionProvider } from 'next-auth/react';
import MuiThemeProvider from './MuiThemeProvider';

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <MuiThemeProvider>
        {children}
      </MuiThemeProvider>
    </SessionProvider>
  );
}