import React, { useState, useEffect } from 'react';
import api from '../../api';
import { History, Calendar, CheckCircle2, XCircle, Search, Filter, Loader2 } from 'lucide-react';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/student');
      setAttendance(response.data);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(a => {
    const matchesSearch = a.module_title.toLowerCase().includes(search.toLowerCase()) || 
                          a.course_title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-500">View your day-wise attendance for all courses</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-full sm:w-auto">
            {['all', 'present', 'absent'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-8 py-5">Course & Module</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{record.module_title}</h4>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{record.course_title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-300" />
                      {record.date}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {record.status === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {record.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-8 py-20 text-center text-gray-400 italic">
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Attendance Summary Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl shadow-primary-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Keep it up!</h3>
            <p className="text-primary-100 opacity-90">Consistency is the key to mastering new IT skills. Check your dashboard for more progress insights.</p>
          </div>
          <div className="flex gap-12 text-center">
            <div>
              <p className="text-xs font-bold text-primary-200 uppercase tracking-widest mb-1">Total Days</p>
              <p className="text-3xl font-black">{attendance.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-primary-200 uppercase tracking-widest mb-1">Present Rate</p>
              <p className="text-3xl font-black">
                {attendance.length > 0 
                  ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;