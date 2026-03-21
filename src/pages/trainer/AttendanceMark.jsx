import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft, Save, Loader2, UserCheck, Calendar, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';

const AttendanceMark = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [courseId, moduleId]);

  const fetchData = async () => {
    try {
      const courseRes = await api.get(`/courses/${courseId}`);
      const moduleInfo = courseRes.data.modules.find(m => m.id === parseInt(moduleId));

      setCourse(courseRes.data);
      setModule(moduleInfo);

      const attendanceRes = await api.get(`/courses/${courseId}/modules/${moduleId}/attendance`);

      setStudents(attendanceRes.data.map(s => ({
        ...s,
        status: s.status || 'present'
      })));

    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (enrollmentId, status) => {
    setStudents(students.map(s =>
      s.enrollment_id === enrollmentId ? { ...s, status } : s
    ));
  };

  /* ---------------- SAVE ATTENDANCE ---------------- */

  const handleSubmit = async () => {

    setSaving(true);

    try {

      await Promise.all(
        students.map(s =>
          api.post('/attendance', {
            enrollment_id: s.enrollment_id,
            module_id: moduleId,
            status: s.status,
            date
          })
        )
      );

      alert("Attendance saved successfully");

      // Download Excel automatically
      window.open("http://localhost:5000/api/export-attendance");

      navigate('/trainer');

    } catch (err) {
      console.error('Failed to save attendance', err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- EXPORT EXCEL BUTTON ---------------- */

  const exportExcel = () => {

const token = localStorage.getItem("token");

fetch("http://localhost:5000/api/export-attendance", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.blob())
.then(blob => {

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "attendance_report.xlsx";
  a.click();

});
};

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trainer')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">{course?.title}</h1>
            <p className="text-sm text-gray-500">
              Day {module?.day_number}: {module?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">

          {/* DATE */}

          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-700 outline-none"
            />
          </div>

          {/* EXPORT BUTTON */}

          <button
  onClick={exportExcel}
  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md"
>
Export Excel
</button>

          {/* SAVE BUTTON */}

          <button
            onClick={handleSubmit}
            disabled={saving || students.length === 0}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4 mr-2" />
            }

            {saving ? 'Saving...' : 'Save Attendance'}
          </button>

        </div>
      </div>

      {/* STUDENT TABLE */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center text-primary-600 gap-2">
            <UserCheck className="w-5 h-5" />
            <h2 className="font-bold text-xs uppercase tracking-wider">
              Student Attendance List
            </h2>
          </div>

          <span className="text-xs font-medium text-gray-400">
            {students.length} Students Enrolled
          </span>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="bg-white text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-8 py-4">Student Name</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Quick Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

              {students.map((student) => (

                <tr key={student.enrollment_id} className="hover:bg-gray-50">

                  <td className="px-8 py-5">
                    <div className="flex items-center">

                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm mr-4">
                        {student.name.charAt(0)}
                      </div>

                      <span className="font-semibold text-gray-700">
                        {student.name}
                      </span>

                    </div>
                  </td>

                  <td className="px-8 py-5 text-center">

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase
                      ${student.status === 'present'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {student.status}
                    </span>

                  </td>

                  <td className="px-8 py-5 text-right">

                    <div className="flex items-center justify-end gap-3">

                      <button
                        onClick={() => handleStatusChange(student.enrollment_id, 'present')}
                        className={`p-2 rounded-lg
                          ${student.status === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                          }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleStatusChange(student.enrollment_id, 'absent')}
                        className={`p-2 rounded-lg
                          ${student.status === 'absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                          }`}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AttendanceMark;