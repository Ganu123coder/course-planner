import React, { useEffect, useState } from "react";
import api from "../../api";

const DayPlanner = () => {

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);

  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");

  const [plan, setPlan] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await api.get("/courses");
    setCourses(res.data);
  };

  const openCourse = async (courseId) => {

    const res = await api.get(`/courses/${courseId}`);

    setSelectedCourse(res.data);
    setModules(res.data.modules);

  };

  const generatePlan = () => {

  if (!days || !hours) {
    alert("Enter days and hours");
    return;
  }

  let moduleIndex = 0;
  const generatedPlan = [];

  for (let d = 1; d <= days; d++) {

    let startHour = 9;
    const daySchedule = [];

    for (let h = 0; h < hours; h++) {

      if (moduleIndex < modules.length) {

        const endHour = startHour + 1;

        daySchedule.push({
          time: `${startHour}:00 - ${endHour}:00`,
          task: modules[moduleIndex].title
        });

        moduleIndex++;

        startHour = endHour;

        // break time
        daySchedule.push({
          time: `${startHour}:00 - ${startHour}:10`,
          task: "Break"
        });

      }

    }

    // add revision slot
    daySchedule.push({
      time: `${startHour}:10 - ${startHour + 1}:00`,
      task: "Revision / Practice"
    });

    generatedPlan.push({
      day: d,
      schedule: daySchedule
    });

  }

  setPlan(generatedPlan);

};
  return (

    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">Hourly Study Planner</h1>

      {!selectedCourse && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {courses.map(course => (

            <div key={course.id} className="bg-white p-6 rounded-xl shadow">

              <h2 className="font-bold text-lg">{course.title}</h2>

              <p className="text-gray-500 text-sm mb-4">
                {course.description}
              </p>

              <button
                onClick={() => openCourse(course.id)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg"
              >
                Plan Study
              </button>

            </div>

          ))}

        </div>

      )}

      {selectedCourse && (

        <div className="space-y-6">

          <button
            onClick={() => {
              setSelectedCourse(null);
              setPlan([]);
            }}
            className="text-primary-600"
          >
            ← Back
          </button>

          <h2 className="text-xl font-bold">
            {selectedCourse.title} Study Plan
          </h2>

          <div className="flex gap-4">

            <input
              type="number"
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              placeholder="Hours per day"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <button
              onClick={generatePlan}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Generate Plan
            </button>

          </div>

          {plan.length > 0 && (

            <div className="space-y-6">

              {plan.map(day => (

                <div key={day.day} className="bg-white p-6 rounded-xl shadow">

                  <h3 className="font-bold mb-3">Day {day.day}</h3>

                  {day.schedule.map((item, index) => (

                    <div
                      key={index}
                      className="flex justify-between border-b py-2"
                    >

                      <span className="font-medium">
                        {item.time}
                      </span>

                      <span>{item.module}</span>

                    </div>

                  ))}

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