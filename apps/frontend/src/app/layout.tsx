import { ClientLayout } from '../components/ClientLayout';
import './global.css';

export const metadata = {
  title: 'Welcome to dailybyte',
  description:
    'Dailybyte: Daily 5-minute coding challenges to improve your programming skills. Fun, quick and consistent practice with instant feedback. Level up your coding abilities one byte-sized challenge at a time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
