import React, { useState, useEffect } from 'react';
import api from '../../api';
import { BookOpen, Search, UserPlus, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, myCoursesRes] = await Promise.all([
        api.get('/courses'),
        api.get('/my-courses')
      ]);
      setCourses(coursesRes.data);
      setMyCourses(myCoursesRes.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await api.post('/enroll', { course_id: courseId });
      // Update local state for immediate feedback
      setMyCourses([...myCourses, courses.find(c => c.id === courseId)]);
    } catch (err) {
      console.error('Enrollment failed', err);
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId) => myCourses.some(c => c.id === courseId);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-500">Find the right IT course for your career goals</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <div 
  key={course.id}
  onClick={() => navigate(`/student/course/${course.id}`)}
  className="bg-white rounded-2xl ... cursor-pointer"
>
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400'} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {isEnrolled(course.id) && (
                <div className="absolute top-4 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-gray-500 mb-8 line-clamp-3 h-15 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnroll(course.id);
                  }}
                  disabled={isEnrolled(course.id) || enrolling === course.id}
                  className={`flex items-center justify-center flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isEnrolled(course.id)
                      ? 'bg-green-50 text-green-600 border border-green-100 cursor-default'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-primary-200'
                  } disabled:opacity-50`}
                >
                  {enrolling === course.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEnrolled(course.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Enrolled
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Enroll Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default CourseList;