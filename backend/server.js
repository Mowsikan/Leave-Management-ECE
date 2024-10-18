const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { strict } = require('assert');
require('dotenv').config(); // Use dotenv to manage sensitive data
const upload = multer({ dest: 'uploads/' }); 

// Function to send leave request to staff
async function sendLeaveRequestToStaff(staffEmail, leaveDetails) {
  // Create a transporter object using your SMTP settings
  const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your email provider
      auth: {
          user: 'mowsikan02@gmail.com', // Your email
          pass: 'yvtd pwxb iscn lzwl', // Your email password or app-specific password
      },
  });

  // Define the email options
  const mailOptions = {
      from: 'mowsikan02@gmail.com',
      to: staffEmail,
      subject: 'New Leave Request',
      text: `Leave Request Details: \n${JSON.stringify(leaveDetails, null, 2)}`,
  };

  // Send the email
  try {
      await transporter.sendMail(mailOptions);
      console.log('Leave request email sent successfully');
  } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Rethrow to handle it in the route
  }
}

// Function to get staff email based on department
function getStaffByDepartment(department) {
  const staffMap = {
      "ECE-A": "vignesh1ccece@gmail.com",
      "ECE-B": "gowri2ccece@gmail.com",
      "ACT": "sivaranjani3ccece@gmail.com",
  };

  return staffMap[department] || null;
}
// Setup transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable for email
    pass: process.env.EMAIL_PASS, // Use environment variable for password
  },
});

// Function to send an email
const sendEmail = (recipient, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Leave-Management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // Appends timestamp
});


// CC Schema and Model
const ccSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true, enum: ['ECE-A', 'ECE-B', 'ACT'] },
});

const CC = mongoose.model('CC', ccSchema);

// Student Schema and Model
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, require: true},
  rollNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  password: { type: String, required: true }, // Add password field for students
  profileImage: { type: String },
});

const Student = mongoose.model('Student', StudentSchema);

// Leave Request Schema and Model

const leaveRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  reason: { type: String, required: true },
  proof: { type: String, required: false }, // Assuming proof can be optional
  date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Forwarded to HOD', 'Accepted', 'Rejected'],  // Add your statuses here
    default: 'Pending', required: true}, // Default status
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

// Routes

// Test route
app.get('/test', (req, res) => {
  res.send('Test route working!');
});

// Submit leave request
app.post("/submit-leave", async (req, res) => {
  const { studentName, rollNo, department, year, reason, proof } = req.body;

  const staffEmail = getStaffByDepartment(department);

  if (staffEmail) {
      try {
          await sendLeaveRequestToStaff(staffEmail, {
              studentName,
              rollNo,
              department,
              year,
              reason,
              proof,
          });

          res.status(200).json({ message: "Leave request sent to staff" });
      } catch (error) {
          res.status(500).json({ message: "Error sending leave request", error: error.message });
      }
  } else {
      res.status(400).json({ message: "Staff not found for department" });
  }
});

// GET leave requests based on status
// Example route in your backend (Express)



// Get leave requests
app.post('/api/leave-requests', upload.single('proof'), async (req, res) => {
  // Validate incoming request data
  const { name, rollNo, department, yearOfStudy, reason, date } = req.body;
  if (!name || !rollNo || !department || !yearOfStudy || !reason || !date) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const leaveRequest = new LeaveRequest({
    name,
    rollNo,
    department,
    yearOfStudy,
    reason,
    proof: req.file ? req.file.path : null, // Store the file path if a proof is uploaded
    date,
    status: 'Pending' // Set default status to 'Pending'
  });

  try {
    // Save leave request to the database
    await leaveRequest.save();

    // Get staff email based on department
    const staffEmail = getStaffByDepartment(department);
    if (staffEmail) {
      await sendLeaveRequestToStaff(staffEmail, leaveRequest);
    } else {
      console.warn(`No staff found for department: ${department}`);
    }

    res.status(201).json({ message: 'Leave request submitted successfully!' });
  } catch (error) {
    console.error('Error creating leave request:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error creating leave request', error: error.message });
  }
});

//get all requests
app.get('/api/leave-requests', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ status: 'Pending' }); // Adjust query as needed
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});

//getting single request


// Route for staff to approve and forward the request to HOD
app.put('/api/leave-requests/forward-to-hod/:id', async (req, res) => {
  try {
    const leaveRequestId = req.params.id;

    // Find the leave request and update its status to 'Forwarded to HOD'
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      leaveRequestId,
      { status: 'Forwarded to HOD' },  // Status updated only after staff approval
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave request forwarded to HOD successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error while forwarding leave request', error });
  }
});

// Route to get all leave requests for HOD (only requests forwarded to HOD)
// Assuming LeaveRequest is your Mongoose model
app.get('/api/leave-requests/hod', async (req, res) => {
  try {
    // Fetch leave requests where the status is 'Forwarded to HOD'
    const leaveRequests = await LeaveRequest.find({ status: 'Forwarded to HOD' });
    res.status(200).json(leaveRequests); // Return the fetched requests
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests for HOD', error });
  }

});

// Function to handle sending leave requests
app.post('/send-leave-request', async (req, res) => {
  try {
      const { name, department, reason, date, proof } = req.body;

      // Find the student's details
      const student = await LeaveRequest.findById(name);
      if (!student) {
          return res.status(404).json({ message: 'Student not found' });
      }

      // Determine the class and find the corresponding staff (CC) for that class
      let ccStaff;
      switch (department) {
          case 'ECE-A':
              ccStaff = await LeaveRequest.findOne({ role: 'staff', classHandled: 'ECE-A' });
              break;
          case 'ECE-B':
              ccStaff = await LeaveRequest.findOne({ role: 'staff', classHandled: 'ECE-B' });
              break;
          case 'ACT':
              ccStaff = await LeaveRequest.findOne({ role: 'staff', classHandled: 'ACT' });
              break;
          default:
              return res.status(400).json({ message: 'Invalid class name' });
      }

      if (!ccStaff) {
          return res.status(404).json({ message: 'No class coordinator found for this class' });
      }

      // Create a new leave request
      const leaveRequest = new LeaveRequest({
          name: student._id,
          name: student.name,
          department: className,
          reason,
          date,
          proof,
          status: 'Pending',
          StaffId: ccStaff._id, // Assign to the respective CC
      });

      await leaveRequest.save();

      // Notify the staff (you could add email functionality here)
      res.status(200).json({ message: 'Leave request sent to your class coordinator', ccStaff: ccStaff.name });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Accept leave request (Staff or HOD)
app.put('/api/accept-leave/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'Accepted' });
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.status(200).send(request);
  } catch (error) {
    res.status(500).send('Error accepting leave request.');
  }
});

// Reject leave request
app.delete('/api/leave/reject/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    sendEmail('selvihari2006@gmail.com', 'Leave Request Rejected', `Your leave request has been rejected.`);
    res.status(200).send({ message: 'Leave request rejected.' });
  } catch (error) {
    res.status(500).send('Error rejecting leave request.');
  }
});

// Student login
app.post('/login/student', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Compare the provided password with the stored password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT for authentication
    const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, student });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


// CC Login
app.post('/login/cc', async (req, res) => {
  const { email, password } = req.body;

  try {
    const cc = await CC.findOne({ email });
    if (!cc) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare plain text passwords directly
    if (cc.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: cc._id, department: cc.department }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Middleware to protect routes for CC
const authenticateCC = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
