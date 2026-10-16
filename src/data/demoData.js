/**
 * DEMO DATA — Phase 1 (UI preview only)
 *
 * These records are static placeholders used only to demonstrate
 * the interface layout and component design. They are NOT stored
 * in any database and do NOT represent real complaints or users.
 *
 * Remove or replace with real API calls in Phase 2.
 */

export const DEMO_USER = {
  id: 'student-demo-001',
  name: 'Priya Sharma',
  email: 'priya.sharma@college.edu',
  rollNumber: 'CS2021047',
  role: 'student',
  department: 'Computer Science',
  year: '3rd Year',
};

export const DEMO_ADMIN = {
  id: 'admin-demo-001',
  name: 'Prof. Ramesh Kumar',
  email: 'ramesh.kumar@college.edu',
  role: 'admin',
  department: 'Facility Management',
};

export const CATEGORIES = [
  { value: 'electrical',    label: 'Electrical',          icon: 'Zap' },
  { value: 'plumbing',      label: 'Plumbing',            icon: 'Droplets' },
  { value: 'it',            label: 'IT / Network',        icon: 'Wifi' },
  { value: 'civil',         label: 'Civil / Structural',  icon: 'Building2' },
  { value: 'housekeeping',  label: 'Housekeeping',        icon: 'Brush' },
  { value: 'furniture',     label: 'Furniture',           icon: 'Armchair' },
  { value: 'security',      label: 'Security',            icon: 'Shield' },
  { value: 'other',         label: 'Other',               icon: 'MoreHorizontal' },
];

export const LOCATIONS = [
  'Main Building — Block A',
  'Main Building — Block B',
  'Main Building — Block C',
  'Science Block',
  'Library',
  'Canteen',
  'Computer Labs — Lab 1',
  'Computer Labs — Lab 2',
  'Boys Hostel',
  'Girls Hostel',
  'Sports Complex',
  'Auditorium',
  'Administrative Office',
  'Parking Area',
];

export const DEMO_COMPLAINTS = [
  {
    id: 'CF-2026-001',
    title: 'Flickering tube-light in Lab 2',
    category: 'electrical',
    location: 'Computer Labs — Lab 2',
    description: 'The tube-light above row 3 has been flickering for three days, causing eye strain during practical sessions.',
    status: 'in-progress',
    priority: 'high',
    submittedBy: 'Priya Sharma',
    submittedAt: '2026-10-12T09:30:00',
    updatedAt: '2026-10-13T11:00:00',
    assignedTo: 'Electrician Team',
  },
  {
    id: 'CF-2026-002',
    title: 'Leaking tap in Boys Hostel washroom',
    category: 'plumbing',
    location: 'Boys Hostel',
    description: 'Tap in the ground-floor washroom is continuously dripping, wasting significant water.',
    status: 'pending',
    priority: 'medium',
    submittedBy: 'Arjun Mehta',
    submittedAt: '2026-10-13T14:00:00',
    updatedAt: '2026-10-13T14:00:00',
    assignedTo: null,
  },
  {
    id: 'CF-2026-003',
    title: 'Wi-Fi not working — Science Block 2nd floor',
    category: 'it',
    location: 'Science Block',
    description: 'The Wi-Fi access point on the second floor of the Science Block is completely offline since Monday.',
    status: 'resolved',
    priority: 'high',
    submittedBy: 'Dr. Anita Rao',
    submittedAt: '2026-10-09T08:00:00',
    updatedAt: '2026-10-11T15:30:00',
    assignedTo: 'IT Department',
  },
  {
    id: 'CF-2026-004',
    title: 'Broken chair in Lecture Hall B-204',
    category: 'furniture',
    location: 'Main Building — Block B',
    description: 'Three chairs have broken legs and are a safety hazard. Students are avoiding that row.',
    status: 'pending',
    priority: 'low',
    submittedBy: 'Kavya Reddy',
    submittedAt: '2026-10-14T10:15:00',
    updatedAt: '2026-10-14T10:15:00',
    assignedTo: null,
  },
  {
    id: 'CF-2026-005',
    title: 'Foul smell from drain near Canteen',
    category: 'plumbing',
    location: 'Canteen',
    description: 'The drain outside the canteen has been clogged and is emitting a very strong odour, affecting the dining area.',
    status: 'in-progress',
    priority: 'high',
    submittedBy: 'Rohit Gupta',
    submittedAt: '2026-10-10T12:00:00',
    updatedAt: '2026-10-12T09:00:00',
    assignedTo: 'Housekeeping Team',
  },
  {
    id: 'CF-2026-006',
    title: 'Projector not working — Room A-101',
    category: 'electrical',
    location: 'Main Building — Block A',
    description: 'The projector remote is not responding and the projector cannot be turned on manually either.',
    status: 'rejected',
    priority: 'medium',
    submittedBy: 'Sneha Joshi',
    submittedAt: '2026-10-08T09:00:00',
    updatedAt: '2026-10-09T11:00:00',
    assignedTo: null,
  },
  {
    id: 'CF-2026-007',
    title: 'Library washroom light non-functional',
    category: 'electrical',
    location: 'Library',
    description: 'The washroom in the library basement has no lighting. Users have to use phone flashlights.',
    status: 'resolved',
    priority: 'medium',
    submittedBy: 'Arjun Mehta',
    submittedAt: '2026-10-07T16:00:00',
    updatedAt: '2026-10-08T10:00:00',
    assignedTo: 'Electrician Team',
  },
  {
    id: 'CF-2026-008',
    title: 'Water cooler not cooling — Block C',
    category: 'electrical',
    location: 'Main Building — Block C',
    description: 'The water cooler on the ground floor of Block C dispenses water at room temperature.',
    status: 'pending',
    priority: 'medium',
    submittedBy: 'Priya Sharma',
    submittedAt: '2026-10-15T08:45:00',
    updatedAt: '2026-10-15T08:45:00',
    assignedTo: null,
  },
];

export const DEMO_STATS = {
  total:      DEMO_COMPLAINTS.length,
  pending:    DEMO_COMPLAINTS.filter(c => c.status === 'pending').length,
  inProgress: DEMO_COMPLAINTS.filter(c => c.status === 'in-progress').length,
  resolved:   DEMO_COMPLAINTS.filter(c => c.status === 'resolved').length,
  rejected:   DEMO_COMPLAINTS.filter(c => c.status === 'rejected').length,
};

// Student-specific view (subset)
export const MY_COMPLAINTS = DEMO_COMPLAINTS.filter(
  c => c.submittedBy === DEMO_USER.name
);

export const MY_STATS = {
  total:      MY_COMPLAINTS.length,
  pending:    MY_COMPLAINTS.filter(c => c.status === 'pending').length,
  inProgress: MY_COMPLAINTS.filter(c => c.status === 'in-progress').length,
  resolved:   MY_COMPLAINTS.filter(c => c.status === 'resolved').length,
};
