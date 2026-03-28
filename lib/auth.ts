// Re-export from root auth.ts for backward compatibility
export { auth, signIn, signOut } from '@/auth';

// Legacy helper: drop-in replacement for getServerSession(authOptions)
import { auth } from '@/auth';
export async function getSession() {
  return auth();
}
