import './global.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'NEXO - Business Management System',
  description: 'Multi-Portal Business Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
