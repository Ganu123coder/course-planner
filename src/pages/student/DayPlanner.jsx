import React, { useEffect, useState } from "react";
import api from "../../api";

const DayPlanner = () => {

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {

    try {

      const res = await api.get("/courses");

      setCourses(res.data);

    } catch (err) {

      console.error("Failed to fetch courses");

    }

  };

  const generatePlan = async (courseId) => {

    try {

      const res = await api.get(`/courses/${courseId}`);

      setSelectedCourse(res.data);

      setModules(res.data.modules);

      const savedProgress =
        JSON.parse(localStorage.getItem(`planner_${courseId}`)) || {};

      setProgress(savedProgress);

    } catch (err) {

      console.error("Failed to load modules");

    }

  };

  const toggleComplete = (moduleId) => {

    const updated = {
      ...progress,
      [moduleId]: !progress[moduleId]
    };

    setProgress(updated);

    localStorage.setItem(
      `planner_${selectedCourse.id}`,
      JSON.stringify(updated)
    );

  };

  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Day Wise Study Planner</h1>

      {!selectedCourse && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {courses.map(course => (

            <div
              key={course.id}
              className="bg-white p-6 rounded-xl shadow border"
            >

              <h2 className="text-lg font-bold">{course.title}</h2>

              <p className="text-gray-500 text-sm mb-4">
                {course.description}
              </p>

              <button
                onClick={() => generatePlan(course.id)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg"
              >
                Generate Plan
              </button>

            </div>

          ))}

        </div>

      )}

      {selectedCourse && (

        <div>

          <button
            onClick={() => setSelectedCourse(null)}
            className="mb-4 text-primary-600"
          >
            ← Back to Courses
          </button>

          <h2 className="text-xl font-bold mb-6">
            {selectedCourse.title} Study Plan
          </h2>

          <div className="space-y-4">

            {modules.map(module => (

              <div
                key={module.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
              >

                <div>

                  <h3 className="font-semibold">
                    Day {module.day_number}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    {module.title}
                  </p>

                </div>

                <button
                  onClick={() => toggleComplete(module.id)}
                  className={`px-4 py-2 rounded-lg ${
                    progress[module.id]
                      ? "bg-green-600 text-white"
                      : "bg-gray-200"
                  }`}
                >

                  {progress[module.id] ? "Completed" : "Mark Done"}

                </button>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

};

export default DayPlanner;