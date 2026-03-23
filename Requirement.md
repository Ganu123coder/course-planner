# IT Training Center Management System Requirements Document 
 1. Application Overview 
 1.1 Application Name 
 IT Training Center Management System 
 
 1.2 Application Description 
 A web-based management system for IT training centers that enables trainers to create and manage courses with day-wise modules, while students can enroll in courses and track their attendance. The system provides role-based access for trainers and students with dedicated dashboards for each user type. 
 
 2. User Roles 
 2.1 Trainer 
 Create and manage IT courses 
 Create day-wise modules for each course 
 Mark student attendance for each module 
 View enrolled students 
 2.2 Student 
 Browse available courses 
 Enroll in courses 
 View attendance dashboard 
 Track attendance records per module 
 3. Core Features 
 3.1 Course Management 
 Trainers can create courses with title, description, and image 
 Each course contains multiple day-wise modules 
 Modules include day number, title, and content 
 3.2 Enrollment System 
 Students can enroll in available courses 
 System tracks enrollment relationships between students and courses 
 3.3 Attendance Management 
 Trainers can mark attendance for each module 
 Attendance records include status and date 
 Students can view their attendance history 
 3.4 Dashboard 
 Trainer dashboard for course and attendance management 
 Student dashboard displaying attendance records in table format with interactive elements 
 4. Database Structure 
 4.1 Users Table 
 id 
 name 
 email 
 password 
 role 
 4.2 Courses Table 
 id 
 title 
 description 
 image 
 4.3 Modules Table 
 id 
 course_id 
 day_number 
 title 
 content 
 4.4 Enrollments Table 
 id 
 student_id 
 course_id 
 4.5 Attendance Table 
 id 
 enrollment_id 
 module_id 
 status 
 date 
 5. User Interface Requirements 
 5.1 Dashboard Design 
 Use React for building interactive dashboards 
 Implement role-based dashboard views 
 5.2 Attendance Page 
 Display attendance data in table format 
 Include checkboxes for attendance marking 
 Design should be attractive and interactive 
 Provide clear visual feedback for user actions