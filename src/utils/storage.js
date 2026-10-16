import { DEMO_USER, DEMO_ADMIN, DEMO_COMPLAINTS } from '../data/demoData';

const USERS_KEY = 'campusfix_users';
const CURRENT_USER_KEY = 'campusfix_current_user';
const COMPLAINTS_KEY = 'campusfix_complaints';

/**
 * Default seeded demo users.
 * Supports both official name emails and quick demo emails (student@college.edu / admin@college.edu).
 */
const INITIAL_USERS = [
  {
    ...DEMO_USER,
    password: 'demo123456',
  },
  {
    ...DEMO_USER,
    id: 'student-demo-alias',
    email: 'student@college.edu',
    password: 'demo123456',
  },
  {
    ...DEMO_ADMIN,
    password: 'demo123456',
  },
  {
    ...DEMO_ADMIN,
    id: 'admin-demo-alias',
    email: 'admin@college.edu',
    password: 'demo123456',
  },
];

/**
 * Safely parse JSON from localStorage with a fallback
 */
function getStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely write JSON to localStorage
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

/**
 * Initialize mock database in localStorage if not already set.
 */
export function initStorage() {
  const users = getStorage(USERS_KEY, null);
  if (!users || !Array.isArray(users) || users.length === 0) {
    setStorage(USERS_KEY, INITIAL_USERS);
  }

  const complaints = getStorage(COMPLAINTS_KEY, null);
  if (!complaints || !Array.isArray(complaints) || complaints.length === 0) {
    setStorage(COMPLAINTS_KEY, DEMO_COMPLAINTS);
  }
}

// Ensure storage is initialized on module load
initStorage();

/* ── User & Auth Operations ────────────────────────────────── */

export function getUsers() {
  initStorage();
  return getStorage(USERS_KEY, INITIAL_USERS);
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === normalized) || null;
}

export function registerUser(userData) {
  const users = getUsers();
  const normalized = userData.email.trim().toLowerCase();
  
  if (users.some(u => u.email.toLowerCase() === normalized)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: userData.fullName.trim(),
    email: normalized,
    role: userData.role || 'student',
    rollNumber: userData.rollNumber?.trim() || '',
    department: userData.department || (userData.role === 'admin' ? 'Administration' : 'General'),
    year: userData.year || '',
    password: userData.password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStorage(USERS_KEY, users);
  return newUser;
}

export function authenticateUser(email, password, role) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (role && user.role !== role) {
    return {
      success: false,
      error: `This account is registered as ${user.role === 'admin' ? 'an Administrator' : 'a Student'}. Please select the matching role.`,
    };
  }

  return { success: true, user };
}

export function getCurrentUser() {
  return getStorage(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    // Exclude password from current session storage for hygiene
    const { password: _, ...safeUser } = user;
    setStorage(CURRENT_USER_KEY, safeUser);
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/* ── Complaint Operations ──────────────────────────────────── */

export function getComplaints() {
  initStorage();
  return getStorage(COMPLAINTS_KEY, DEMO_COMPLAINTS);
}

export function getComplaintsForUser(user) {
  if (!user) return [];
  const all = getComplaints();
  
  // If user is Priya Sharma or alias, also match the demo records attributed to Priya Sharma
  const userEmail = (user.email || '').toLowerCase();
  const userName = (user.name || '').toLowerCase();

  return all.filter(c => {
    const submitterName = (c.submittedBy || '').toLowerCase();
    const submitterEmail = (c.studentEmail || '').toLowerCase();
    const submitterId = c.studentId || '';

    if (submitterId && submitterId === user.id) return true;
    if (submitterEmail && submitterEmail === userEmail) return true;
    if (submitterName && submitterName === userName) return true;

    return false;
  });
}

export function addComplaint(data, user) {
  const complaints = getComplaints();

  // Generate ID e.g. CF-2026-009 or next sequential
  const nextNum = complaints.length + 1;
  const newId = `CF-2026-${String(nextNum).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newComplaint = {
    id: newId,
    title: data.title.trim(),
    category: data.category,
    location: data.location,
    priority: data.priority || 'medium',
    description: data.description.trim(),
    additionalNotes: data.additionalNotes?.trim() || '',
    status: 'pending',
    submittedBy: user?.name || 'Anonymous Student',
    studentId: user?.id || null,
    studentEmail: user?.email || '',
    submittedAt: now,
    updatedAt: now,
    assignedTo: null,
    imageUrl: data.imageUrl || null,
  };

  // Add at the top of the list
  const updated = [newComplaint, ...complaints];
  setStorage(COMPLAINTS_KEY, updated);
  return newComplaint;
}

export function updateComplaintStatus(complaintId, newStatus) {
  const complaints = getComplaints();
  const updated = complaints.map(c => {
    if (c.id === complaintId) {
      return {
        ...c,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return c;
  });
  setStorage(COMPLAINTS_KEY, updated);
  return updated;
}

export function getStats(complaintsList = []) {
  return {
    total: complaintsList.length,
    pending: complaintsList.filter(c => c.status === 'pending').length,
    inProgress: complaintsList.filter(c => c.status === 'in-progress').length,
    resolved: complaintsList.filter(c => c.status === 'resolved').length,
    rejected: complaintsList.filter(c => c.status === 'rejected').length,
  };
}
