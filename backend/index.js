const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./database');
const ExcelJS = require('exceljs');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// ================= FILE UPLOAD =================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


// ================= AUTH MIDDLEWARE =================

const authenticateToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET, (err, user) => {

    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();

  });

};



// ================= AUTH ROUTES =================

app.post('/api/register', (req, res) => {

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {

    const stmt = db.prepare(`
      INSERT INTO users (name,email,password,role)
      VALUES (?,?,?,?)
    `);

    const result = stmt.run(name, email, hashedPassword, role);

    const token = jwt.sign(
      { id: result.lastInsertRowid, role, name, email },
      SECRET
    );

    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        name,
        email,
        role
      }
    });

  } catch (err) {

    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Server error" });

  }

});


app.post('/api/login', (req, res) => {

  const { email, password } = req.body;

  const user = db.prepare(
    "SELECT * FROM users WHERE email = ?"
  ).get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    SECRET
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

});



// ================= COURSE ROUTES =================

app.get('/api/courses', (req, res) => {

  const courses = db.prepare(`
    SELECT 
      c.*,
      COUNT(e.id) AS student_count
    FROM courses c
    LEFT JOIN enrollments e
    ON c.id = e.course_id
    GROUP BY c.id
  `).all();

  res.json(courses);

});


app.get('/api/courses/:id', (req, res) => {

  const course = db.prepare(
    "SELECT * FROM courses WHERE id=?"
  ).get(req.params.id);

  if (!course) return res.status(404).json({ message: "Course not found" });

  const modules = db.prepare(`
    SELECT * FROM modules
    WHERE course_id = ?
    ORDER BY day_number
  `).all(req.params.id);

  res.json({ ...course, modules });

});


app.post('/api/courses', authenticateToken, (req, res) => {

  if (req.user.role !== "trainer") {
    return res.status(403).json({ message: "Trainers only" });
  }

  const { title, description, image } = req.body;

  const stmt = db.prepare(`
    INSERT INTO courses (title,description,image)
    VALUES (?,?,?)
  `);

  const result = stmt.run(title, description, image);

  res.json({
    id: result.lastInsertRowid,
    title,
    description,
    image
  });

});



// ================= MODULE ROUTES =================

app.post('/api/modules', authenticateToken, (req, res) => {

  if (req.user.role !== "trainer") {
    return res.status(403).json({ message: "Trainers only" });
  }

  const { course_id, day_number, title, content } = req.body;

  const stmt = db.prepare(`
    INSERT INTO modules (course_id,day_number,title,content)
    VALUES (?,?,?,?)
  `);

  stmt.run(course_id, day_number, title, content);

  res.json({ message: "Module added successfully" });

});



// ================= ENROLLMENT =================

app.post('/api/enroll', authenticateToken, (req, res) => {

  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Students only" });
  }

  const { course_id } = req.body;

  try {

    const stmt = db.prepare(`
      INSERT INTO enrollments (student_id,course_id)
      VALUES (?,?)
    `);

    stmt.run(req.user.id, course_id);

    res.json({ message: "Enrolled successfully" });

  } catch {

    res.status(400).json({ message: "Already enrolled" });

  }

});


app.get('/api/my-courses', authenticateToken, (req, res) => {

  const courses = db.prepare(`
    SELECT c.*, e.id AS enrollment_id
    FROM courses c
    JOIN enrollments e
    ON c.id = e.course_id
    WHERE e.student_id = ?
  `).all(req.user.id);

  res.json(courses);

});



// ================= ASSIGNMENT UPLOAD =================

app.post('/api/upload-assignment', upload.single('file'), (req, res) => {

  const { courseId, studentId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const stmt = db.prepare(`
    INSERT INTO assignments (course_id,student_id,file_path)
    VALUES (?,?,?)
  `);

  stmt.run(courseId, studentId, req.file.filename);

  res.json({ message: "Assignment uploaded successfully" });

});



// ================= PROGRESS SYSTEM =================

// Create table
db.prepare(`
CREATE TABLE IF NOT EXISTS progress (
id INTEGER PRIMARY KEY AUTOINCREMENT,
student_id INTEGER,
course_id INTEGER,
module_id INTEGER,
completed INTEGER DEFAULT 1,
completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
UNIQUE(student_id,module_id)
)
`).run();



// Mark module complete

app.post('/api/progress/complete', authenticateToken, (req, res) => {

  const { course_id, module_id } = req.body;

  try {

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO progress
      (student_id,course_id,module_id)
      VALUES (?,?,?)
    `);

    stmt.run(req.user.id, Number(course_id), Number(module_id));

    res.json({ message: "Module completed" });

  } catch (err) {

    res.status(500).json({ message: "Error saving progress" });

  }

});



// Get course progress

app.get('/api/progress/:courseId', authenticateToken, (req, res) => {

  const courseId = Number(req.params.courseId);

  try {

    const total = db.prepare(`
      SELECT COUNT(*) AS count
      FROM modules
      WHERE course_id=?
    `).get(courseId).count;

    const completed = db.prepare(`
      SELECT COUNT(*) AS count
      FROM progress
      WHERE student_id=? AND course_id=?
    `).get(req.user.id, courseId).count;

    const progress = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    res.json({
      totalModules: total,
      completedModules: completed,
      progress
    });

  } catch {

    res.status(500).json({ message: "Error fetching progress" });

  }

});



// ================= SERVER =================

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});