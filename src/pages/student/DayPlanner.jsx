import React, { useEffect, useState } from "react";
import api from "../../api";

const DayPlanner = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await api.get("/study-plan/1/1");
    setPlans(res.data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Day Wise Planner</h1>

      {plans.map(plan => (
        <div key={plan.id} className="p-4 border rounded mb-2">
          <h3>{plan.title}</h3>
          <p>Date: {plan.planned_date}</p>
        </div>
      ))}
    </div>
  );
};

export default DayPlanner;