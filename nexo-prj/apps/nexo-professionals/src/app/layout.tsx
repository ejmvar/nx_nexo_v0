import './global.css';
import MuiThemeProvider from './MuiThemeProvider';

export const metadata = {
  title: 'NEXO Professionals Portal',
  description: 'Professional portal for NEXO',
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
