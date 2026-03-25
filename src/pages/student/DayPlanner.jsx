import React, { useEffect, useState } from "react";
import api from "../../api";

const DayPlanner = () => {

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [days, setDays] = useState("");
  const [plan, setPlan] = useState([]);

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

  const openCourse = async (courseId) => {

    const res = await api.get(`/courses/${courseId}`);

    setSelectedCourse(res.data);

    setModules(res.data.modules);

  };

  const generatePlan = () => {

    if (!days || days <= 0) {

      alert("Enter valid number of days");

      return;

    }

    const modulesPerDay = Math.ceil(modules.length / days);

    const generatedPlan = [];

    let index = 0;

    for (let i = 1; i <= days; i++) {

      const dayModules = modules.slice(index, index + modulesPerDay);

      generatedPlan.push({
        day: i,
        modules: dayModules
      });

      index += modulesPerDay;

    }

    setPlan(generatedPlan);

  };

  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Smart Study Planner</h1>

      {/* COURSE LIST */}

      {!selectedCourse && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {courses.map(course => (

            <div
              key={course.id}
              className="bg-white p-6 rounded-xl shadow border"
            >

              <h2 className="font-bold text-lg">{course.title}</h2>

              <p className="text-gray-500 text-sm mb-4">
                {course.description}
              </p>

              <button
                onClick={() => openCourse(course.id)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg"
              >
                Create Plan
              </button>

            </div>

          ))}

        </div>

      )}

      {/* COURSE PLANNER */}

      {selectedCourse && (

        <div className="space-y-6">

          <button
            onClick={() => {
              setSelectedCourse(null);
              setPlan([]);
            }}
            className="text-primary-600"
          >
            ← Back to Courses
          </button>

          <h2 className="text-xl font-bold">
            {selectedCourse.title} Planner
          </h2>

          {/* ENTER DAYS */}

          <div className="flex gap-4">

            <input
              type="number"
              placeholder="Enter number of days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="border p-3 rounded-lg w-64"
            />

            <button
              onClick={generatePlan}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Generate Plan
            </button>

          </div>

          {/* PLAN RESULT */}

          {plan.length > 0 && (

            <div className="space-y-4">

              {plan.map(day => (

                <div
                  key={day.day}
                  className="bg-white p-5 rounded-xl shadow"
                >

                  <h3 className="font-bold mb-3">
                    Day {day.day}
                  </h3>

                  <ul className="list-disc ml-5 space-y-1">

                    {day.modules.map(module => (

                      <li key={module.id}>
                        {module.title}
                      </li>

                    ))}

                  </ul>

                </div>

              ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

};

export default DayPlanner;