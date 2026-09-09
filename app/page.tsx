// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirects / to /login at the server level
  redirect('/login');
}
