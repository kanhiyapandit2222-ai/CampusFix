import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import {
  getCurrentUser as getLocalUser,
  setCurrentUser as setLocalUser,
  logoutUser as logoutLocalUser,
  authenticateUser as authenticateLocalUser,
  registerUser as registerLocalUser,
} from '../utils/storage';

/**
 * Format friendly user-facing error message from Firebase Auth error
 */
export function formatAuthError(error) {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed sign-in attempts. Please try again in a few minutes.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Subscribe to authentication state changes.
 * Returns unsubscribe function.
 */
export function subscribeToAuth(onUserChange) {
  if (!isFirebaseConfigured || !auth) {
    // Demo fallback mode: return current local user
    const localUser = getLocalUser();
    onUserChange(localUser);
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      onUserChange(null);
      return;
    }

    try {
      // Fetch custom claims to verify admin role
      const tokenResult = await firebaseUser.getIdTokenResult();
      const hasAdminClaim = Boolean(tokenResult.claims.admin);

      // Fetch user profile from Cloud Firestore
      let profile = {};
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          profile = docSnap.data();
        }
      } catch (docErr) {
        console.warn('Unable to retrieve Firestore profile doc:', docErr.message);
      }

      // Role is determined securely by admin custom claim
      const role = hasAdminClaim ? 'admin' : (profile.role || 'student');

      const appUser = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        role,
        department: profile.department || (role === 'admin' ? 'Facility Management' : 'General'),
        rollNumber: profile.rollNumber || '',
        year: profile.year || '',
        isFirebase: true,
      };

      onUserChange(appUser);
    } catch (err) {
      console.error('Error resolving user auth state:', err);
      onUserChange(null);
    }
  });
}

/**
 * Sign in using email and password
 */
export async function loginUser(email, password, expectedRole) {
  if (!isFirebaseConfigured || !auth) {
    // Demo fallback mode
    const res = authenticateLocalUser(email, password, expectedRole);
    if (res.success) {
      setLocalUser(res.user);
    }
    return res;
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const tokenResult = await credential.user.getIdTokenResult(true);
    const hasAdminClaim = Boolean(tokenResult.claims.admin);

    // Fetch user profile from Firestore
    let profile = {};
    try {
      const docSnap = await getDoc(doc(db, 'users', credential.user.uid));
      if (docSnap.exists()) {
        profile = docSnap.data();
      }
    } catch (e) {
      console.warn('Profile read error on login:', e.message);
    }

    const actualRole = hasAdminClaim ? 'admin' : (profile.role || 'student');

    if (expectedRole && expectedRole !== actualRole) {
      // Sign out from auth to prevent unauthorized session
      await signOut(auth);
      return {
        success: false,
        error: `This account is registered as ${actualRole === 'admin' ? 'an Administrator' : 'a Student'}. Please select the matching role.`,
      };
    }

    const user = {
      uid: credential.user.uid,
      id: credential.user.uid,
      name: profile.name || credential.user.displayName || credential.user.email.split('@')[0],
      email: credential.user.email,
      role: actualRole,
      department: profile.department || (actualRole === 'admin' ? 'Facility Management' : 'General'),
      rollNumber: profile.rollNumber || '',
      year: profile.year || '',
      isFirebase: true,
    };

    return { success: true, user };
  } catch (error) {
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Register a new student account.
 * Note: Public signup MUST NEVER create administrator accounts.
 */
export async function registerNewStudent(formData) {
  if (!isFirebaseConfigured || !auth) {
    // Demo fallback
    try {
      const newUser = registerLocalUser({
        ...formData,
        role: 'student', // Enforce student role
      });
      setLocalUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  try {
    const email = formData.email.trim().toLowerCase();
    const name = formData.fullName.trim();

    // 1. Create account in Firebase Authentication
    const credential = await createUserWithEmailAndPassword(auth, email, formData.password);
    const user = credential.user;

    // 2. Set Firebase Auth display name
    try {
      await updateProfile(user, { displayName: name });
    } catch (profileErr) {
      console.warn('Could not set displayName on Firebase Auth user:', profileErr.message);
    }

    // 3. Create initial Firestore user profile
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role: 'student', // Public signup strictly restricted to student role
        rollNumber: formData.rollNumber?.trim() || '',
        department: formData.department || '',
        year: formData.year || '',
        createdAt: serverTimestamp(),
      });
    } catch (dbErr) {
      console.error('Failed to create Firestore profile document:', dbErr);
      // Account exists in Auth, return user with note
    }

    const appUser = {
      uid: user.uid,
      id: user.uid,
      name,
      email,
      role: 'student',
      department: formData.department || '',
      rollNumber: formData.rollNumber?.trim() || '',
      year: formData.year || '',
      isFirebase: true,
    };

    return { success: true, user: appUser };
  } catch (error) {
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Log out current user
 */
export async function logoutCurrentSession() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  logoutLocalUser();
}
