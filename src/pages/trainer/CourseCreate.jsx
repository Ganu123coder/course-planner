import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Plus, Trash2, Save, ArrowLeft, Loader2, BookOpen, Layers } from 'lucide-react';

const CourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    image: '',
  });
  const [modules, setModules] = useState([
    { day_number: 1, title: '', content: '' }
  ]);

  const handleCourseChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleModuleChange = (index, e) => {
    const updatedModules = [...modules];
    updatedModules[index][e.target.name] = e.target.value;
    setModules(updatedModules);
  };

  const addModule = () => {
    setModules([...modules, { day_number: modules.length + 1, title: '', content: '' }]);
  };

  const removeModule = (index) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    // Update day numbers
    const renumberedModules = updatedModules.map((mod, i) => ({ ...mod, day_number: i + 1 }));
    setModules(renumberedModules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create course
      const courseResponse = await api.post('/courses', courseData);
      const courseId = courseResponse.data.id;

      // Create modules
      await Promise.all(
        modules.map(module => api.post('/modules', { ...module, course_id: courseId }))
      );

      navigate('/trainer');
    } catch (err) {
      console.error('Failed to create course', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trainer')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-500">Define course details and day-wise modules</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Details Section */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 text-primary-600">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-xs">Course Basic Info</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
              <input
                type="text"
                name="title"
                required
                value={courseData.title}
                onChange={handleCourseChange}
                placeholder="e.g. Modern Full-Stack Development"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                rows="4"
                required
                value={courseData.description}
                onChange={handleCourseChange}
                placeholder="Write a brief overview of what students will learn..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail URL (Optional)</label>
              <input
                type="text"
                name="image"
                value={courseData.image}
                onChange={handleCourseChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-primary-600">
              <Layers className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Day-wise Modules</h2>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Day
            </button>
          </div>

          <div className="space-y-6">
            {modules.map((module, index) => (
              <div key={index} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 relative group">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-primary-600 border border-gray-100">
                    {module.day_number}
                  </div>
                  <input
                    type="text"
                    name="title"
                    required
                    value={module.title}
                    onChange={(e) => handleModuleChange(index, e)}
                    placeholder="Module Title (e.g. Intro to React)"
                    className="flex-1 bg-transparent text-lg font-bold text-gray-800 border-b border-transparent focus:border-primary-300 outline-none transition-all py-1 px-0"
                  />
                </div>
                
                <textarea
                  name="content"
                  rows="2"
                  required
                  value={module.content}
                  onChange={(e) => handleModuleChange(index, e)}
                  placeholder="What will be covered this day?"
                  className="w-full bg-white px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                ></textarea>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-10 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg hover:bg-primary-700 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreate;