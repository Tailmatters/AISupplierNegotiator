import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard if authenticated, otherwise redirect to auth page
  redirect('/auth');
}