import type { Metadata } from 'next';
import '@/components/Navbar.css';

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
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
