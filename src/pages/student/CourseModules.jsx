import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CourseModules = () => {
  const { id } = useParams(); // course id
  const { user } = useAuth();

  const [modules, setModules] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch(`https://course-planner3.onrender.com/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setModules(data.modules || []);
        setCourseTitle(data.title);
      });
  }, [id]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", id);
    formData.append("studentId", user.id);

    try {
  const res = await fetch("https://course-planner3.onrender.com/api/upload-assignment", {
    method: "POST",
    body: formData
  });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{courseTitle} - Modules</h2>

      {/* Modules List */}
      {modules.map((module) => (
        <div
          key={module.id}
          style={{
            padding: "10px",
            margin: "10px 0",
            background: "#f5f5f5",
            borderRadius: "8px"
          }}
        >
          <strong>Day {module.day_number}:</strong> {module.title}
        </div>
      ))}

      {/* Upload Section */}
      <div style={{ marginTop: "30px" }}>
        <h3>Upload Assignment (PDF)</h3>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={handleUpload}>
          Upload Assignment
        </button>
      </div>
    </div>
  );
};

export default CourseModules;