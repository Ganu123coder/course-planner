import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

const DayPlanner = () => {

  const [plans, setPlans] = useState([]);
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");

  /* Load saved plans */

  useEffect(() => {
    const savedPlans = JSON.parse(localStorage.getItem("studyPlans")) || [];
    setPlans(savedPlans);
  }, []);

  /* Save plans */

  const savePlans = (updatedPlans) => {
    setPlans(updatedPlans);
    localStorage.setItem("studyPlans", JSON.stringify(updatedPlans));
  };

  /* Add new plan */

  const addPlan = () => {
    if (!task || !date) {
      alert("Please enter task and date");
      return;
    }

    const newPlan = {
      id: Date.now(),
      task,
      date
    };

    const updatedPlans = [...plans, newPlan];

    savePlans(updatedPlans);

    setTask("");
    setDate("");
  };

  /* Delete plan */

  const deletePlan = (id) => {
    const updatedPlans = plans.filter(plan => plan.id !== id);
    savePlans(updatedPlans);
  };

  return (
    <div className="max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Day Wise Study Planner</h1>

      {/* Add Plan */}

      <div className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">

        <input
          type="text"
          placeholder="Study topic (ex: React Hooks)"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <button
          onClick={addPlan}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2"/>
          Add Plan
        </button>

      </div>

      {/* Plans List */}

      <div className="space-y-4">

        {plans.length === 0 && (
          <p className="text-gray-500">No study plans created yet.</p>
        )}

        {plans.map(plan => (

          <div
            key={plan.id}
            className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
          >

            <div>
              <h3 className="font-semibold">{plan.task}</h3>
              <p className="text-sm text-gray-500">{plan.date}</p>
            </div>

            <button
              onClick={() => deletePlan(plan.id)}
              className="text-red-500"
            >
              <Trash2 className="w-5 h-5"/>
            </button>

          </div>

        ))}

      </div>

    </div>
  );
};

export default DayPlanner;