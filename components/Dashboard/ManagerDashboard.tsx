
import React, { useState, useEffect, useMemo } from 'react';
import { database } from '../../store';
import { User, Room, RoomStatus, Complaint, ComplaintStatus, IssueType, Bill, UserRole } from '../../types';
import { AppSection } from '../../App';
import { BUILDINGS, ISSUE_TYPES, MONTHS } from '../../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { 
  Users, Bed, AlertTriangle, Search, 
  Download, Printer, CheckCircle2, 
  Clock, ArrowUpRight, DollarSign, Receipt, Trash2, UserX, UserCheck
} from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  activeSection: AppSection;
  setActiveSection: (s: AppSection) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, activeSection, setActiveSection }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [billMonth, setBillMonth] = useState(MONTHS[new Date().getMonth()]);

  useEffect(() => {
    refreshData();
  }, [activeSection]);

  const refreshData = () => {
    setRooms(database.getRooms());
    setComplaints(database.getComplaints());
    setStudents(database.getUsers().filter(u => u.role === UserRole.STUDENT));
    setBills(database.getBills());
  };

  const stats = useMemo(() => {
    const totalRooms = rooms.filter(r => r.status !== RoomStatus.STORE_ROOM).length;
    const totalBeds = totalRooms * 2;
    const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedBy?.length || 0), 0);
    const vacantBeds = totalBeds - occupiedBeds;
    
    // For general room count stats
    const occupiedRooms = rooms.filter(r => (r.occupiedBy?.length || 0) > 0).length;
    const fullyOccupiedRooms = rooms.filter(r => (r.occupiedBy?.length || 0) === 2).length;
    const vacantRooms = rooms.filter(r => r.status === RoomStatus.AVAILABLE && (r.occupiedBy?.length || 0) === 0).length;
    
    const pendingComplaints = complaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length;
    const totalBilled = bills.reduce((a, b) => a + b.messBill + b.roomDue, 0);
    const unpaidDues = bills.filter(b => b.status === 'UNPAID').reduce((a, b) => a + b.messBill + b.roomDue, 0);
    
    return { totalRooms, occupiedRooms, vacantRooms, occupiedBeds, vacantBeds, pendingComplaints, totalBilled, unpaidDues, totalBeds };
  }, [rooms, complaints, bills]);

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      database.updateRoom({ ...room, status });
      refreshData();
    }
  };

  const updateComplaintStatus = (complaintId: string, status: ComplaintStatus) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      database.updateComplaint({ ...complaint, status });
      refreshData();
    }
  };

  const toggleBillStatus = (bill: Bill) => {
    const updatedBill: Bill = {
      ...bill,
      status: bill.status === 'PAID' ? 'UNPAID' : 'PAID'
    };
    database.addOrUpdateBill(updatedBill);
    refreshData();
  };

  // Billing Form Logic
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [messBillInput, setMessBillInput] = useState(2500);
  const [roomDueInput, setRoomDueInput] = useState(1500);

  const handleCreateBill = () => {
    if (!selectedStudentId) {
      alert("Please select a student.");
      return;
    }
    database.addOrUpdateBill({
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudentId,
      month: billMonth,
      messBill: messBillInput,
      roomDue: roomDueInput,
      status: 'UNPAID'
    });
    refreshData();
    alert(`Bill generated for ${billMonth}`);
  };

  const handleDownloadReport = () => {
    const header = "Student Name,Email,Room,Month,Mess Bill,Room Due,Total,Status\n";
    const rows = bills.map(b => {
      const s = students.find(stud => stud.id === b.studentId);
      return `"${s?.name || 'Unknown'}","${s?.email || 'N/A'}","${s?.roomNumber || 'No Room'}","${b.month}",${b.messBill},${b.roomDue},${b.messBill + b.roomDue},"${b.status}"`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Hostel_Billing_Report_${billMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-indigo-600" />} label="Total Students" value={students.length} sub={`${stats.occupiedBeds}/${stats.totalBeds} Beds Filled`} />
        <StatCard icon={<Bed className="text-emerald-600" />} label="Active Rooms" value={stats.occupiedRooms} sub={`${stats.vacantRooms} totally vacant`} />
        <StatCard icon={<AlertTriangle className="text-orange-600" />} label="Complaints" value={stats.pendingComplaints} sub="Pending Actions" />
        <StatCard icon={<DollarSign className="text-rose-600" />} label="Outstanding" value={`₹${stats.unpaidDues.toLocaleString()}`} sub="Unpaid Amount" />
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
        <h3 className="text-lg font-bold mb-6">Building Statistics (Occupied Beds)</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={BUILDINGS.map(b => {
            const buildingRooms = rooms.filter(r => r.buildingId === b.id && r.status !== RoomStatus.STORE_ROOM);
            const buildingOccupancy = buildingRooms.reduce((acc, r) => acc + (r.occupiedBy?.length || 0), 0);
            return { 
              name: b.name, 
              Capacity: b.totalRooms * 2, 
              Occupancy: buildingOccupancy 
            };
          })}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Occupancy" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Capacity" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-lg">Room Inventory</h3>
          <p className="text-xs text-slate-400">Manage rooms and occupancy (Max 2 students/room)</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Search room number..." 
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
            <tr>
              <th className="p-6">Room</th>
              <th className="p-6">Building</th>
              <th className="p-6">Occupancy</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Toggle Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rooms.filter(r => r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())).map(room => (
              <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-6 font-bold">{room.roomNumber}</td>
                <td className="p-6 text-sm text-slate-500">{BUILDINGS.find(b => b.id === room.buildingId)?.name}</td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          (room.occupiedBy?.length || 0) === 2 ? 'bg-indigo-600' : 
                          (room.occupiedBy?.length || 0) === 1 ? 'bg-amber-400' : 'bg-slate-200'
                        }`}
                        style={{ width: `${((room.occupiedBy?.length || 0) / 2) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{room.occupiedBy?.length || 0}/2</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    room.status === RoomStatus.OCCUPIED ? 'bg-indigo-100 text-indigo-700' : 
                    room.status === RoomStatus.STORE_ROOM ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => updateRoomStatus(room.id, room.status === RoomStatus.AVAILABLE ? RoomStatus.STORE_ROOM : RoomStatus.AVAILABLE)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title={room.status === RoomStatus.STORE_ROOM ? "Mark as Available" : "Mark as Store Room"}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderComplaints = () => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
       <div className="p-8 border-b font-bold text-lg">Maintenance Pipeline</div>
       <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
          <tr>
            <th className="p-6">Student</th>
            <th className="p-6">Issue</th>
            <th className="p-6">Status</th>
            <th className="p-6">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {complaints.length > 0 ? complaints.map(c => (
            <tr key={c.id}>
              <td className="p-6">
                <div className="font-bold">{students.find(s => s.id === c.studentId)?.name || 'Former Student'}</div>
                <div className="text-[10px] text-slate-400">{rooms.find(r => r.id === c.roomId)?.roomNumber}</div>
              </td>
              <td className="p-6">
                <div className="font-semibold text-indigo-600">{c.issueType}</div>
                <div className="text-xs text-slate-500 truncate max-w-xs">{c.description}</div>
              </td>
              <td className="p-6">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {c.status}
                </span>
              </td>
              <td className="p-6">
                <div className="flex gap-2">
                  <button onClick={() => updateComplaintStatus(c.id, ComplaintStatus.RESOLVED)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 size={16} />
                  </button>
                  <button onClick={() => updateComplaintStatus(c.id, ComplaintStatus.IN_PROGRESS)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Clock size={16} />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="p-10 text-center text-slate-400">No maintenance requests found.</td></tr>
          )}
        </tbody>
       </table>
    </div>
  );

  const renderBilling = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Receipt className="text-indigo-600" /> Create Monthly Bill
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Student & Room</label>
                <select 
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Select Resident</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.roomNumber || 'Unallocated'} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Month</label>
                   <select 
                     className="w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all"
                     value={billMonth}
                     onChange={e => setBillMonth(e.target.value)}
                   >
                     {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Mess Bill (₹)</label>
                   <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all" value={messBillInput} onChange={e => setMessBillInput(Number(e.target.value))} />
                </div>
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Room Due (₹)</label>
                 <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl outline-none transition-all" value={roomDueInput} onChange={e => setRoomDueInput(Number(e.target.value))} />
              </div>
              <button 
                onClick={handleCreateBill} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <DollarSign size={18} /> Generate Invoice
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg">Report Tool</h4>
                <div className="p-2 bg-slate-800 rounded-lg">
                   <Download className="text-indigo-400" size={20} />
                </div>
             </div>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">Download full billing details for {billMonth} including student status and totals.</p>
             <button 
               onClick={handleDownloadReport}
               className="w-full py-3 border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl font-bold transition-all text-sm"
             >
                Download Excel (CSV)
             </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
               <h3 className="font-bold text-lg">Invoices ({billMonth})</h3>
               <p className="text-xs text-slate-400 mt-1">Found {bills.filter(b => b.month === billMonth).length} records</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Total Pending: ₹{bills.filter(b => b.status === 'UNPAID' && b.month === billMonth).reduce((a, b) => a + b.messBill + b.roomDue, 0).toLocaleString()}
               </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-6">Resident</th>
                  <th className="p-6">Month</th>
                  <th className="p-6">Amount Due</th>
                  <th className="p-6">Status / Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bills.filter(b => b.month === billMonth).map(b => {
                  const s = students.find(stud => stud.id === b.studentId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-slate-900">{s?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-400">{s?.roomNumber || 'No Room Assigned'}</div>
                      </td>
                      <td className="p-6 text-sm font-medium text-slate-600">{b.month}</td>
                      <td className="p-6 font-mono font-bold text-slate-900">₹{b.messBill + b.roomDue}</td>
                      <td className="p-6">
                        <button 
                          onClick={() => toggleBillStatus(b)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${
                            b.status === 'PAID' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm shadow-emerald-100' 
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200 shadow-sm shadow-rose-100'
                          }`}
                        >
                          {b.status === 'PAID' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                          {b.status === 'PAID' ? 'Clear' : 'Unpaid'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {bills.filter(b => b.month === billMonth).length === 0 && (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">No bills generated for {billMonth} yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
            <h3 className="font-bold text-lg mb-8">Bed Occupancy ({stats.occupiedBeds}/{stats.totalBeds})</h3>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie 
                  data={[
                    {name: 'Occupied Beds', value: stats.occupiedBeds}, 
                    {name: 'Vacant Beds', value: stats.vacantBeds}
                  ]} 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  <Cell fill="#4F46E5" />
                  <Cell fill="#E2E8F0" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
            <h3 className="font-bold text-lg mb-8">Invoice Status Overview</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={[
                {name: 'Paid Invoices', value: bills.filter(b => b.status === 'PAID').length}, 
                {name: 'Unpaid Invoices', value: bills.filter(b => b.status === 'UNPAID').length}
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );

  switch(activeSection) {
    case 'ROOMS': return renderRooms();
    case 'COMPLAINTS': return renderComplaints();
    case 'BILLING': return renderBilling();
    case 'ANALYTICS': return renderAnalytics();
    case 'DASHBOARD':
    default: return renderOverview();
  }
};

const StatCard = ({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
      <ArrowUpRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={16} />
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">{sub}</p>
  </div>
);

export default ManagerDashboard;
