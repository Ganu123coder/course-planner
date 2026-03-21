import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { BookOpen, CheckCircle2, XCircle, ChevronRight, Loader2, Award, History } from 'lucide-react';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, attendanceRes] = await Promise.all([
        api.get('/my-courses'),
        api.get('/attendance/student')
      ]);
      setCourses(coursesRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (courseId) => {
    const courseAttendance = attendance.filter(a => {
      // Find courseId by checking if it matches the module's courseId
      // In a real app, this logic would be more robust
      return true; // placeholder for now
    });
    // This is simplified for the demo
    return attendance.length > 0 ? '75%' : '0%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500">Track your learning progress and attendance</p>
        </div>
        <Link
          to="/student/courses"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Browse Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Enrolled Courses</p>
            <h3 className="text-2xl font-bold text-gray-900">{courses.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Present Days</p>
            <h3 className="text-2xl font-bold text-gray-900">{attendance.filter(a => a.status === 'present').length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Absent Days</p>
            <h3 className="text-2xl font-bold text-gray-900">{attendance.filter(a => a.status === 'absent').length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              My Courses
            </h2>
            <Link to="/student/courses" className="text-xs font-bold text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {courses.map(course => (
              <div key={course.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=100'} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div>
                    <h4 className="font-bold text-gray-800">{course.title}</h4>
                    <p className="text-xs text-gray-400">Enrolled on March 15, 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">Attendance</p>
                    <p className="text-sm font-bold text-primary-600">{calculateAttendanceRate(course.id)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400" />
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                <p>You haven't enrolled in any courses yet.</p>
                <Link to="/student/courses" className="text-primary-600 font-bold mt-2 block">Browse available courses</Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-primary-600" />
              Recent Attendance
            </h2>
            <Link to="/student/attendance" className="text-xs font-bold text-primary-600 hover:underline">Full History</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {attendance.slice(0, 5).map(record => (
              <div key={record.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{record.module_title}</h4>
                  <p className="text-xs text-gray-400">{record.course_title} • {record.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
            {attendance.length === 0 && (
              <div className="p-12 text-center text-gray-400 italic text-sm">
                No attendance records found yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;