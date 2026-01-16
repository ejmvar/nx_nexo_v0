import './global.css';
import MuiThemeProvider from './MuiThemeProvider';

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
        <MuiThemeProvider>
          {children}
        </MuiThemeProvider>
      </body>
    </html>
  );
}
