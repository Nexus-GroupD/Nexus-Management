import type { Metadata } from 'next';
import ChatBot from '@/components/ChatBot';

export const metadata: Metadata = {
  title: 'Nexus Management',
  description: 'Employee scheduling system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
