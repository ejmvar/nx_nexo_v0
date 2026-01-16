import './global.css';
import { Providers } from '../components/providers';

export const metadata = {
  title: 'Employee Portal - NEXO',
  description: 'Employee portal for NEXO CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
