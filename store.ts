
import { User, Room, Complaint, Bill } from './types';
// Fixed: STORAGE_KEYS is exported from constants, not types
import { generateInitialRooms, STORAGE_KEYS } from './constants';

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const database = {
  getUsers: () => getFromStorage<User[]>(STORAGE_KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = database.getUsers();
    setToStorage(STORAGE_KEYS.USERS, [...users, user]);
  },
  
  getRooms: () => getFromStorage<Room[]>(STORAGE_KEYS.ROOMS, generateInitialRooms()),
  updateRoom: (updatedRoom: Room) => {
    const rooms = database.getRooms();
    const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    setToStorage(STORAGE_KEYS.ROOMS, newRooms);
  },

  getComplaints: () => getFromStorage<Complaint[]>(STORAGE_KEYS.COMPLAINTS, []),
  addComplaint: (complaint: Complaint) => {
    const complaints = database.getComplaints();
    setToStorage(STORAGE_KEYS.COMPLAINTS, [complaint, ...complaints]);
  },
  updateComplaint: (updated: Complaint) => {
    const complaints = database.getComplaints();
    const newComplaints = complaints.map(c => c.id === updated.id ? updated : c);
    setToStorage(STORAGE_KEYS.COMPLAINTS, newComplaints);
  },

  getBills: () => getFromStorage<Bill[]>(STORAGE_KEYS.BILLS, []),
  addOrUpdateBill: (bill: Bill) => {
    const bills = database.getBills();
    const index = bills.findIndex(b => b.studentId === bill.studentId && b.month === bill.month);
    if (index > -1) {
      bills[index] = bill;
    } else {
      bills.push(bill);
    }
    setToStorage(STORAGE_KEYS.BILLS, bills);
  }
};