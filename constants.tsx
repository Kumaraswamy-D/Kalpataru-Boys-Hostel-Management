
import { Building, IssueType, RoomStatus } from './types';

export const BUILDINGS: Building[] = [
  { id: 'hemavati', name: 'Hemavati', allowedYears: [1], totalRooms: 68 },
  { id: 'kaveri', name: 'Kaveri', allowedYears: [2, 3], totalRooms: 60 },
  { id: 'mca', name: 'MCA', allowedYears: [4], totalRooms: 45 },
];

export const ISSUE_TYPES = Object.values(IssueType);

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const STORAGE_KEYS = {
  USERS: 'hostel_users',
  ROOMS: 'hostel_rooms',
  COMPLAINTS: 'hostel_complaints',
  BILLS: 'hostel_bills',
  AUTH: 'hostel_auth_user'
};

// Initial Room Generation Helper
export const generateInitialRooms = () => {
  const rooms = [];
  for (const building of BUILDINGS) {
    for (let i = 1; i <= building.totalRooms; i++) {
      // Randomly assign some as store rooms for demo
      const isStore = i > 0 && i % 15 === 0;
      rooms.push({
        id: `${building.id}-${i}`,
        buildingId: building.id,
        roomNumber: `${building.name[0]}${i.toString().padStart(3, '0')}`,
        status: isStore ? RoomStatus.STORE_ROOM : RoomStatus.AVAILABLE
      });
    }
  }
  return rooms;
};