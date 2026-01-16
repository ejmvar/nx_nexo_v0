import './global.css';
import { Providers } from '../components/providers';

export const metadata = {
  title: 'NEXO Professional Portal',
  description: 'NEXO CRM Professional Access Portal',
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
