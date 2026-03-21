import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { BookOpen, Users, Plus, Calendar, ChevronRight, Loader2 } from 'lucide-react';

const TrainerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      // Fetch modules for each course to show count
      const coursesWithModules = await Promise.all(
        response.data.map(async (course) => {
          const res = await api.get(`/courses/${course.id}`);
          return res.data;
        })
      );
      setCourses(coursesWithModules);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500">Manage your IT courses and track student progress</p>
        </div>
        <Link
          to="/trainer/courses/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-200 relative">
              <img 
                src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400'} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary-700 uppercase">
                {course.modules?.length || 0} Modules
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">{course.description}</p>
              
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Modules</h4>
                {course.modules?.slice(0, 3).map((module) => (
                  <Link
                    key={module.id}
                    to={`/trainer/attendance/${course.id}/${module.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold mr-3">
                        D{module.day_number}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                        {module.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400" />
                  </Link>
                ))}
                {(!course.modules || course.modules.length === 0) && (
                  <p className="text-xs italic text-gray-400 py-2">No modules added yet</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first IT training course</p>
          <Link
            to="/trainer/courses/new"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Course
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;