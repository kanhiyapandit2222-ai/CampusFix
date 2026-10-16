/**
 * CampusFix — Administrator Provisioning Script
 * 
 * Sets the Firebase custom claim `{ admin: true }` on a designated user account.
 * NEVER run this script on the client/frontend. Run it only in a secure Node.js environment
 * with a Firebase Service Account key.
 * 
 * Usage:
 *   1. Download your service account key from:
 *      Firebase Console -> Project Settings -> Service accounts -> Generate new private key
 *   2. Save it securely (e.g. `service-account.json` - ignored by git).
 *   3. Set environment variable:
 *      export GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
 *      (Windows PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS=".\service-account.json")
 *   4. Run:
 *      node scripts/set-admin.js <user-email-or-uid>
 */

import admin from 'firebase-admin';

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.error('\x1b[31mError: Please provide a user email or UID.\x1b[0m');
  console.log('Usage: node scripts/set-admin.js <user@college.edu | uid>');
  process.exit(1);
}

// Initialize Admin SDK using default credentials or service-account.json
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (err) {
  console.error('\x1b[31mFailed to initialize Firebase Admin SDK:\x1b[0m', err.message);
  console.error('Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable points to your service account key file.');
  process.exit(1);
}

async function setAdminClaim(identifier) {
  try {
    let userRecord;
    if (identifier.includes('@')) {
      userRecord = await admin.auth().getUserByEmail(identifier);
    } else {
      userRecord = await admin.auth().getUser(identifier);
    }

    // Set custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
    });

    // Also update Firestore profile if doc exists
    const db = admin.firestore();
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      await userDocRef.update({
        role: 'admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await userDocRef.set({
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || 'Administrator',
        role: 'admin',
        department: 'Facility Management',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log(`\x1b[32m✔ Successfully granted administrator privileges to ${userRecord.email} (UID: ${userRecord.uid})\x1b[0m`);
    console.log('The user must sign out and sign in again for the updated token claim to take effect.');
  } catch (error) {
    console.error('\x1b[31mFailed to grant admin claim:\x1b[0m', error.message);
    process.exit(1);
  }
}

setAdminClaim(targetIdentifier);
