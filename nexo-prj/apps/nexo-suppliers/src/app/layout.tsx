import './global.css';
import { ChakraProvider } from '@chakra-ui/react';

export const metadata = {
  title: 'NEXO Suppliers Portal',
  description: 'Supplier portal for NEXO',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
