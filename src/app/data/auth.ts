/**
 * src/app/data/auth.ts
 *
 * Re-exports everything from the Firebase-backed auth library so that all
 * existing consumers (Navbar, Profile, Login, Signup, …) keep working with
 * zero import-path changes.
 */

export {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  sendPasswordResetEmail,
  getUser,
  updateUser,
  useAuth,
  initials,
} from "@/lib/auth-firebase";

export type { User } from "@/lib/auth-firebase";
