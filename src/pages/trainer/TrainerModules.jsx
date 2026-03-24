import React, { useEffect, useState } from "react";
import api from '../../api';

const TrainerModules = ({ courseId }) => {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    api.get(`/modules/${courseId}`)
      .then(res => setModules(res.data))
      .catch(err => console.log(err));
  }, [courseId]);

  return (
    <div>
      <h2>Course Modules</h2>

      <ul>
        {modules.map(module => (
          <li key={module.id}>
            <h3>{module.module_name}</h3>
            <p>{module.description}</p>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default TrainerModules;