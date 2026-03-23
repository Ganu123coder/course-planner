import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import CourseCreate from './pages/trainer/CourseCreate';
import AttendanceMark from './pages/trainer/AttendanceMark';
import StudentDashboard from './pages/student/StudentDashboard';
import CourseList from './pages/student/CourseList';
import AttendanceHistory from './pages/student/AttendanceHistory';
import DashboardLayout from './layouts/DashboardLayout';
import CourseModules from './pages/student/CourseModules';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'trainer' ? '/trainer' : '/student'} />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Trainer Routes */}
          <Route path="/trainer" element={<PrivateRoute role="trainer"><TrainerDashboard /></PrivateRoute>} />
          <Route path="/trainer/courses/new" element={<PrivateRoute role="trainer"><CourseCreate /></PrivateRoute>} />
          <Route path="/trainer/attendance/:courseId/:moduleId" element={<PrivateRoute role="trainer"><AttendanceMark /></PrivateRoute>} />
          <Route path="/modules/:courseId" element={<TrainerModules />} />

          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/courses" element={<PrivateRoute role="student"><CourseList /></PrivateRoute>} />
          <Route path="/student/attendance" element={<PrivateRoute role="student"><AttendanceHistory /></PrivateRoute>} />
          <Route path="/student/course/:id" element={<PrivateRoute role="student"> <CourseModules /></PrivateRoute>
  } 
/>

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;