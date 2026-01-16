import './global.css';
import SessionWrapper from './SessionWrapper';

export const metadata = {
  title: 'NEXO Clients Portal',
  description: 'Client portal for NEXO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
