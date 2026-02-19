
export enum UserRole {
  STUDENT = 'STUDENT',
  MANAGER = 'MANAGER'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  STORE_ROOM = 'STORE_ROOM'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum IssueType {
  FAN = 'Fan Problem',
  LIGHT = 'Light Problem',
  WINDOW = 'Window Issue',
  DOOR = 'Door Issue',
  OTHER = 'Other'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  academicYear?: number;
  roomNumber?: string;
  buildingId?: string;
}

export interface Building {
  id: string;
  name: string;
  allowedYears: number[];
  totalRooms: number;
}

export interface Room {
  id: string;
  buildingId: string;
  roomNumber: string;
  status: RoomStatus;
  occupiedBy?: string[]; // Array of student IDs (max 2)
}

export interface Complaint {
  id: string;
  studentId: string;
  roomId: string;
  buildingId: string;
  issueType: IssueType;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
}

export interface Bill {
  id: string;
  studentId: string;
  month: string;
  messBill: number;
  roomDue: number;
  status: 'PAID' | 'UNPAID';
}
