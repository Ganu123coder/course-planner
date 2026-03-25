import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CourseModules = () => {

  const { id } = useParams(); // course id
  const { user } = useAuth();

  const [modules, setModules] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  // Fetch course and modules
  const fetchCourse = async () => {
    try {

      const res = await fetch(`https://course-planner3.onrender.com/api/courses/${id}`);
      const data = await res.json();

      setModules(data.modules || []);
      setCourseTitle(data.title);

    } catch (err) {
      console.error("Error fetching course", err);
    }
  };

  // Fetch progress
  const fetchProgress = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://course-planner3.onrender.com/api/progress/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setProgress(data.progress || 0);

    } catch (err) {
      console.error("Error fetching progress", err);
    }

  };

  // Mark module complete
  const completeModule = async (moduleId) => {

    try {

      const token = localStorage.getItem("token");

      await fetch(
        "https://course-planner3.onrender.com/api/progress/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            course_id: id,
            module_id: moduleId
          })
        }
      );

      fetchProgress(); // refresh progress

    } catch (err) {
      console.error("Error completing module", err);
    }

  };

  // Load course and progress
  useEffect(() => {
    fetchCourse();
    fetchProgress();
  }, [id]);



  // Upload assignment
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

      const res = await fetch(
        "https://course-planner3.onrender.com/api/upload-assignment",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();
      alert(data.message);

    } catch (err) {

      alert("Upload failed");

    }

  };



  return (
    <div style={{ padding: "20px" }}>

      <h2>{courseTitle} - Modules</h2>

      {/* Progress Bar */}
      <div style={{ margin: "20px 0" }}>

        <h3>Course Progress</h3>

        <div
          style={{
            width: "100%",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden"
          }}
        >

          <div
            style={{
              width: `${progress}%`,
              background: "green",
              color: "white",
              textAlign: "center",
              padding: "5px"
            }}
          >
            {progress}%
          </div>

        </div>

      </div>


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

          <br /><br />

          {user?.role === "student" && (
            <button
              onClick={() => completeModule(module.id)}
              style={{
                padding: "6px 12px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Mark Complete
            </button>
          )}

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