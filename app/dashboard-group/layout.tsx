import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  return <Sidebar>{children}</Sidebar>;
}