
import React, { useState, useEffect } from 'react';
import { database } from '../../store';
import { User, Room, RoomStatus, Complaint, ComplaintStatus, IssueType, Bill } from '../../types';
import { AppSection } from '../../App';
import { BUILDINGS, ISSUE_TYPES, STORAGE_KEYS } from '../../constants';
import { Bed, Info, AlertCircle, FileText, CheckCircle2, Clock, Send, Receipt, Download, XCircle, Users } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  setUser: (u: User) => void;
  activeSection: AppSection;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, setUser, activeSection }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // Complaint Form
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>(IssueType.FAN);
  const [description, setDescription] = useState('');

  const building = BUILDINGS.find(b => b.allowedYears.includes(user.academicYear || 0));

  useEffect(() => {
    setRooms(database.getRooms());
    setComplaints(database.getComplaints().filter(c => c.studentId === user.id));
    setBills(database.getBills().filter(b => b.studentId === user.id));
  }, [user.id, activeSection]);

  const availableRooms = rooms.filter(r => 
    r.buildingId === building?.id && 
    r.status !== RoomStatus.STORE_ROOM &&
    (!r.occupiedBy || r.occupiedBy.length < 2)
  );

  const myRoom = rooms.find(r => r.occupiedBy?.includes(user.id));

  const handleBookRoom = (roomId: string) => {
    if (myRoom) return; 
    
    const room = rooms.find(r => r.id === roomId);
    if (room && (!room.occupiedBy || room.occupiedBy.length < 2)) {
      const newOccupants = [...(room.occupiedBy || []), user.id];
      const updatedRoom: Room = { 
        ...room, 
        occupiedBy: newOccupants,
        status: newOccupants.length === 2 ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE 
      };
      database.updateRoom(updatedRoom);
      
      const updatedUser = { ...user, roomNumber: room.roomNumber, buildingId: room.buildingId };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updatedUser));
      
      setRooms(database.getRooms());
      setSelectedRoomId(null);
    }
  };

  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRoom) return;

    const newComplaint: Complaint = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      roomId: myRoom.id,
      buildingId: myRoom.buildingId,
      issueType,
      description,
      status: ComplaintStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    database.addComplaint(newComplaint);
    setComplaints(prev => [newComplaint, ...prev]);
    setShowComplaintForm(false);
    setDescription('');
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Bed size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Room Status</p>
              <p className="text-2xl font-bold text-slate-800">
                {myRoom ? myRoom.roomNumber : 'Unassigned'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {myRoom ? `Building: ${building?.name}` : 'Go to Rooms to pick one'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Open Issues</p>
              <p className="text-2xl font-bold text-slate-800">
                {complaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Tracked in Complaints</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Dues</p>
              <p className="text-2xl font-bold text-slate-800">
                ₹{bills.reduce((acc, b) => b.status === 'UNPAID' ? acc + b.messBill + b.roomDue : acc, 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Detailed in Billing</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Welcome back, {user.name}</h3>
        <p className="text-slate-500 leading-relaxed max-w-2xl">
          Use the sidebar to manage your hostel stay. Each room accommodates <b>2 students</b>. You can book a room if you haven't already, raise maintenance complaints for any issues, and check your monthly mess and room bills.
        </p>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bed className="text-indigo-600" />
            {myRoom ? 'Your Room' : 'Select a Room'}
          </h3>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
            {building?.name}
          </span>
        </div>

        {!myRoom ? (
          <div className="space-y-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
              <Users size={18} className="text-indigo-500" />
              <span>Rooms show current occupancy. Maximum 2 students per room.</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[500px] overflow-y-auto p-2">
              {availableRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`
                    p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all gap-1
                    ${selectedRoomId === room.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'}
                  `}
                >
                  <span className="text-sm font-bold">{room.roomNumber}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    selectedRoomId === room.id ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {room.occupiedBy?.length || 0}/2 Occupied
                  </span>
                </button>
              ))}
            </div>
            {selectedRoomId && (
              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl animate-in slide-in-from-top-2">
                <p className="font-bold text-indigo-900 mb-1">Confirm Selection</p>
                <p className="text-sm text-indigo-700 mb-4">You are booking a bed in Room {rooms.find(r => r.id === selectedRoomId)?.roomNumber}.</p>
                <button
                  onClick={() => handleBookRoom(selectedRoomId)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bed size={120} />
            </div>
            <h4 className="text-4xl font-extrabold mb-4">{myRoom.roomNumber}</h4>
            <div className="space-y-3 text-slate-400">
              <p className="flex items-center gap-2"><Info size={16} /> Building: <span className="text-white font-medium">{building?.name}</span></p>
              <p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400" /> Status: <span className="text-emerald-400 font-medium">Allocated</span></p>
              <div className="flex items-center gap-2 bg-slate-800 p-3 rounded-xl mt-4 max-w-xs">
                <Users size={16} className="text-indigo-400" />
                <span className="text-sm text-slate-200">Occupancy: {myRoom.occupiedBy?.length}/2 Beds Used</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderComplaints = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Maintenance Requests</h3>
        <button 
          onClick={() => setShowComplaintForm(true)}
          disabled={!myRoom}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          New Complaint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complaints.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                c.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {c.status}
              </span>
              <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <h4 className="font-bold text-slate-900 mb-1">{c.issueType}</h4>
            <p className="text-sm text-slate-500 line-clamp-3">{c.description}</p>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed">
            No complaints found.
          </div>
        )}
      </div>

      {showComplaintForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowComplaintForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <XCircle size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6">Report Issue</h3>
            <form onSubmit={handleRaiseComplaint} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Issue Type</label>
                <select 
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none transition-all"
                  placeholder="Describe the issue..."
                  required
                />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                Submit Complaint
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderBilling = () => (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold text-slate-900 mb-8">Your Invoices</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-400 text-sm border-b pb-4">
              <th className="pb-4">Month</th>
              <th className="pb-4">Total Amount</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bills.map(b => (
              <tr key={b.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-4 font-medium">{b.month}</td>
                <td className="py-4 font-mono font-bold">₹{b.messBill + b.roomDue}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    b.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {b.status === 'PAID' ? 'Clear' : 'Unpaid'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center justify-end gap-1 ml-auto group-hover:underline">
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">
                  No billing records found for your account.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  switch (activeSection) {
    case 'ROOMS': return renderRooms();
    case 'COMPLAINTS': return renderComplaints();
    case 'BILLING': return renderBilling();
    case 'DASHBOARD':
    default: return renderDashboard();
  }
};

export default StudentDashboard;
