import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  getComplaints as getLocalComplaints,
  getComplaintsForUser as getLocalComplaintsForUser,
  addComplaint as addLocalComplaint,
  updateComplaintStatus as updateLocalComplaintStatus,
} from '../utils/storage';

/**
 * Format Firestore document data to a standard complaint object
 */
function formatComplaintDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    // Safely format timestamps (Firestore Timestamp vs ISO string)
    submittedAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || data.submittedAt || new Date().toISOString()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
  };
}

/**
 * Submit a new complaint
 */
export async function submitComplaint(formData, user) {
  if (!isFirebaseConfigured || !db) {
    // Demo fallback
    const saved = addLocalComplaint(formData, user);
    return { success: true, complaint: saved };
  }

  try {
    const complaintData = {
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location,
      priority: formData.priority || 'medium',
      description: formData.description.trim(),
      additionalNotes: formData.additionalNotes?.trim() || '',
      status: 'pending',
      studentUid: user.uid,
      studentName: user.name || 'Student',
      studentEmail: user.email || '',
      submittedBy: user.name || 'Student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      assignedTo: null,
      imageUrl: formData.imageUrl || null,
    };

    const docRef = await addDoc(collection(db, 'complaints'), complaintData);

    return {
      success: true,
      complaint: {
        id: docRef.id,
        ...complaintData,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Failed to submit complaint to Firestore:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit complaint. Please try again.',
    };
  }
}

/**
 * Real-time subscription to complaints submitted by a specific student.
 */
export function subscribeStudentComplaints(user, onUpdate, onError) {
  if (!isFirebaseConfigured || !db) {
    // Demo fallback: poll or return local list
    const complaints = getLocalComplaintsForUser(user);
    onUpdate(complaints);
    return () => {};
  }

  if (!user || !user.uid) {
    onUpdate([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'complaints'),
      where('studentUid', '==', user.uid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(formatComplaintDoc);
        // Sort descending by date locally to avoid mandatory composite index errors
        list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore student complaints subscription error:', err);
        onError?.(err);
      }
    );
  } catch (error) {
    console.error('Failed to query Firestore complaints:', error);
    onError?.(error);
    return () => {};
  }
}

/**
 * Real-time subscription to all complaints (Admin only)
 */
export function subscribeAllComplaints(onUpdate, onError) {
  if (!isFirebaseConfigured || !db) {
    // Demo fallback
    const all = getLocalComplaints();
    onUpdate(all);
    return () => {};
  }

  try {
    const q = query(collection(db, 'complaints'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(formatComplaintDoc);
        list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore all-complaints subscription error:', err);
        onError?.(err);
      }
    );
  } catch (error) {
    console.error('Failed to query all complaints from Firestore:', error);
    onError?.(error);
    return () => {};
  }
}

/**
 * Update complaint status (Admin only)
 */
export async function updateStatus(complaintId, newStatus) {
  if (!isFirebaseConfigured || !db) {
    // Demo fallback
    const updated = updateLocalComplaintStatus(complaintId, newStatus);
    return { success: true, complaints: updated };
  }

  try {
    const docRef = doc(db, 'complaints', complaintId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to update status in Firestore:', error);
    return {
      success: false,
      error: error.message || 'Failed to update complaint status.',
    };
  }
}
