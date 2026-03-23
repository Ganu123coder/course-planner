const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./database');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'supersecretkey';
const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, email, hashedPassword, role);
    const token = jwt.sign({ id: result.lastInsertRowid, role, name, email }, SECRET);
    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role } });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- COURSE ROUTES ---

app.get('/api/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses').all();
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const modules = db.prepare('SELECT * FROM modules WHERE course_id = ? ORDER BY day_number').all(req.params.id);
  res.json({ ...course, modules });
});

app.post('/api/courses', authenticateToken, (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ message: 'Only trainers can create courses' });
  const { title, description, image } = req.body;
  const stmt = db.prepare('INSERT INTO courses (title, description, image) VALUES (?, ?, ?)');
  const result = stmt.run(title, description, image);
  res.status(201).json({ id: result.lastInsertRowid, title, description, image });
});
app.post('/api/upload-assignment', upload.single('file'), (req, res) => {
  const { courseId, studentId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.filename;

  const stmt = db.prepare(`
    INSERT INTO assignments (course_id, student_id, file_path)
    VALUES (?, ?, ?)
  `);

  stmt.run(courseId, studentId, filePath);

  res.json({ message: "Assignment uploaded successfully" });
});
// --- MODULE ROUTES ---

app.post('/api/modules', authenticateToken, (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ message: 'Only trainers can add modules' });
  const { course_id, day_number, title, content } = req.body;
  const stmt = db.prepare('INSERT INTO modules (course_id, day_number, title, content) VALUES (?, ?, ?, ?)');
  const result = stmt.run(course_id, day_number, title, content);
  res.status(201).json({ id: result.lastInsertRowid, course_id, day_number, title, content });
});

// --- ENROLLMENT ROUTES ---

app.post('/api/enroll', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can enroll' });
  const { course_id } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)');
    stmt.run(req.user.id, course_id);
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Already enrolled or invalid course' });
  }
});

app.get('/api/my-courses', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  const enrollments = db.prepare(`
    SELECT c.*, e.id as enrollment_id FROM courses c 
    JOIN enrollments e ON c.id = e.course_id 
    WHERE e.student_id = ?
  `).all(req.user.id);
  res.json(enrollments);
});

// --- ATTENDANCE ROUTES ---

app.post('/api/attendance', authenticateToken, (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ message: 'Only trainers can mark attendance' });
  const { enrollment_id, module_id, status, date } = req.body;
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO attendance (enrollment_id, module_id, status, date) VALUES (?, ?, ?, ?)');
    stmt.run(enrollment_id, module_id, status, date);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error marking attendance' });
  }
});

app.get('/api/attendance/student', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  const records = db.prepare(`
    SELECT a.*, m.title as module_title, c.title as course_title 
    FROM attendance a 
    JOIN modules m ON a.module_id = m.id 
    JOIN courses c ON m.course_id = c.id 
    JOIN enrollments e ON a.enrollment_id = e.id 
    WHERE e.student_id = ?
  `).all(req.user.id);
  res.json(records);
});

// Trainer view: students in a course with their attendance for a module
app.get('/api/courses/:course_id/modules/:module_id/attendance', authenticateToken, (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ message: 'Trainers only' });
  const students = db.prepare(`
    SELECT u.id as student_id, u.name, e.id as enrollment_id, a.status, a.date
    FROM users u 
    JOIN enrollments e ON u.id = e.student_id 
    LEFT JOIN attendance a ON e.id = a.enrollment_id AND a.module_id = ?
    WHERE e.course_id = ?
  `).all(req.params.module_id, req.params.course_id);
  res.json(students);
});

// --- EXPORT ATTENDANCE TO EXCEL ---

app.get('/api/export-attendance', authenticateToken, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ message: 'Only trainers can export reports' });
  }

  try {

    const records = db.prepare(`
      SELECT 
        u.name AS student_name,
        c.title AS course_title,
        m.day_number,
        m.title AS module_title,
        a.status,
        a.date
      FROM attendance a
      JOIN enrollments e ON a.enrollment_id = e.id
      JOIN users u ON e.student_id = u.id
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      ORDER BY c.title, m.day_number
    `).all();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    worksheet.columns = [
      { header: 'Student Name', key: 'student_name', width: 25 },
      { header: 'Course', key: 'course_title', width: 25 },
      { header: 'Day', key: 'day_number', width: 10 },
      { header: 'Module', key: 'module_title', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 15 }
    ];

    records.forEach(record => {
      worksheet.addRow(record);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting attendance' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

