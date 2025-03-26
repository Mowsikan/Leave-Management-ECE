const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { strict } = require('assert');
const { type } = require('os');
const bodyParser = require('body-parser');
require('dotenv').config(); // Use dotenv to manage sensitive data


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

// Increase the limit for the body parser
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp as the filename
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    // Filter file types (e.g., only allow images or PDFs)
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only images and PDFs are allowed');
    }
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {type: String, required: true},
  name: { type: String, required: true },
  rollNo: { type: String, },
  staffId: { type: String, },
  hodId: { type: String, },
  department: { type: String, required: true },
  yearOfStudy: { type: String, },
  profileImage: { type: String }, // URL/path of the uploaded image
});

const User = mongoose.model('User', userSchema)

// Leave Request Schema and Model

const leaveRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  reason: { type: String, required: true },
  leavetype:{type: String, required: true},
  proof: { type: String}, // Assuming proof can be optional
  date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Forwarded to HOD', 'Accepted', 'Rejected'],  // Add your statuses here
    default: 'Pending', required: true}, // Default status
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

// Middleware jwt

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Use the secret from environment variables
    req.user = decoded;  // Attach user data to request
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.use('/uploads', express.static('uploads'));
// Test route
app.get('/test', (req, res) => {
  res.send('Test route working!');
});

// Submit leave request
// Define getStaffByDepartment and sendLeaveRequestToStaff above or import them if they are in another file.

function getStaffByDepartment(department) {
  const departmentStaffEmails = {
    "ECE-A": "ece_staff@example.com",
    "ECE-B": "cse_staff@example.com",
    "ACT": "sivaranjani3ccece@gmail.com",
    // Add other departments as needed
  };
  return departmentStaffEmails[department] || null;
}

async function sendLeaveRequestToStaff(staffEmail, leaveDetails) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: staffEmail,
    subject: 'New Leave Request Received',
    text: `You have received a new leave request:\n\n${JSON.stringify(leaveDetails, null, 2)}`
  };

  await transporter.sendMail(mailOptions);
}

// Submit leave request route
app.post("/submit-leave", async (req, res) => {
  const { studentName, rollNo, department, year, reason, proof } = req.body;

  // Get the staff email based on department
  const staffEmail = getStaffByDepartment(department);

  if (staffEmail) {
    try {
      // Save the leave request in the database
      const leaveRequest = new LeaveRequest({
        name: studentName,  // Ensure the property names match the schema
        rollNo,
        department,
        yearOfStudy: year,  // Ensure the field name matches
        reason,
        leavetype: "Leave",  // Set default leave type if needed
        proof: proof || null,  // Optional proof file
        date: new Date(),  // Use the current date if not provided
        status: "Pending",
      });

      await leaveRequest.save(); // Save to DB

      // Send email notification
      await sendLeaveRequestToStaff(staffEmail, {
        studentName,
        rollNo,
        department,
        year,
        reason,
        proof,
      });

      res.status(201).json({ message: "Leave request saved and sent to staff", leaveRequest });

    } catch (error) {
      console.error("Error saving leave request:", error);
      res.status(500).json({ message: "Error saving leave request", error: error.message });
    }
  } else {
    res.status(400).json({ message: "Staff not found for department" });
  }
});

const moment = require('moment'); // Uncomment if using moment.js

app.post('/api/leave-requests', upload.single('proof'), async (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded File:', req.file);

  const { name, rollNo, department, yearOfStudy, leavetype, reason, date } = req.body;

  if (!name || !rollNo || !department || !yearOfStudy || !reason || !date) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No proof submitted.' });
  }

  // Convert the date to the correct format
  const formattedDate = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD'); // Ensure format is compatible
  if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY.' });
  }

  const leaveRequest = new LeaveRequest({
    name,
    rollNo,
    department,
    yearOfStudy,
    reason,
    leavetype,
    proof: req.file.path,
    date: formattedDate,  // Use formatted date
    status: 'Pending'
  });

  try {
    await leaveRequest.save();

    sendEmail('sivaranjani3ccece@gmail.com', 'New Leave Request', `New Leave Request from ${name}.`);
    sendEmail('selvihari2006@gmail.com', 'Leave Request Status', `Your Leave Request Submitted to CC.`);

    res.status(201).json({
      ...leaveRequest._doc,
      proofUrl: `http://localhost:5000/${req.file.path}`
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Error creating leave request', error: error.message });
  }
});


// Get all pending leave requests (for staff dashboard)
app.get('/api/leave-requests', async (req, res) => {
  try {
    // Find leave requests with status 'Pending'
    const leaveRequests = await LeaveRequest.find({ status: 'Pending' });
    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
});


//login from DB
const secretKey='Mowsi@123';


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
          console.log("User not found");
          return res.status(400).json({ message: 'User not found' });
      }

      console.log("User found:", user);

      // Simplified password comparison (for plain text passwords)
      const isPasswordValid = password === user.password;

      if (!isPasswordValid) {
          console.log("Invalid credentials");
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
          { id: user._id, role: user.role },  // Payload with user ID and role
          secretKey,                           // Secret key for signing the token
          { expiresIn: '1h' }                  // Token expiration (e.g., 1 hour)
      );

      // Send token and user data to client
      res.json({ success: true, token, user: { username: user.username, role: user.role } });
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ message: 'Server error' });
  }
});

//add student deatils from postman to DB
app.post('/add-student', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, password, role, name, rollNo,staffId,hodId, department, yearOfStudy } = req.body;
    const profileImage = req.file ? req.file.path : null; // Get the uploaded image path if available

    // Create new user
    const newUser = new User({
      username,
      password,
      role,
      name,
      rollNo,
      staffId,
      hodId,
      department,
      yearOfStudy,
      profileImage,
    });

    // Save user to the database
    await newUser.save();
    res.status(201).json({ message: 'Student added successfully', user: newUser });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: 'Error adding student', error });
  }
});


// Route for staff to approve and forward the request to HOD
app.put('/api/leave-requests/forward-to-hod/:id', async (req, res) => {
  try {
    const leaveRequestId = req.params.id;
    
    // Update the leave request's status to 'Forwarded to HOD'
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      leaveRequestId,
      { status: 'Forwarded to HOD' },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Send emails to notify that the leave request is forwarded
    await Promise.all([
      sendEmail('mowsikan08@gmail.com', 'New Leave Request', 'New Leave Request forwarded by CC'),
      sendEmail('selvihari2006@gmail.com', 'Leave Request Status', 'Your Leave request forwarded to HOD')
    ]);

    res.status(200).json({ message: 'Leave request forwarded to HOD successfully', leaveRequest });
  } catch (error) {
    console.error('Error forwarding leave request:', error);
    res.status(500).json({ message: 'Server error while forwarding leave request', error });
  }
});

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

// Update or add profile details endpoint
app.post('/update-profile', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, rollNo, department, yearOfStudy } = req.body;
    const profileImage = req.file ? req.file.path : null; // store the image path

    const user = await User.findByIdAndUpdate(req.user.id, {
      name,
      rollNo,
      department,
      yearOfStudy,
      profileImage,
    }, { new: true });

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

//get the user details from db
app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Get user ID from middleware

    console.log("Fetching profile for user ID:", userId); // Debugging

    const user = await User.findById(userId).select('-password'); // Exclude password from result
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in profile route:", error);
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});

// Accept leave request (HOD)
app.put('/api/accept-leave/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'Accepted' });
    sendEmail('selvihari2006@gmail.com', 'Leave Request Status', `Your Leave Request haas been accepted by HOD`);
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
    sendEmail('selvihari2006@gmail.com', 'Leave Request Status', `Your leave request has been rejected.`);
    res.status(200).send({ message: 'Leave request rejected.' });
  } catch (error) {
    res.status(500).send('Error rejecting leave request.');
  }
});

// Backend API route to fetch leave request data
app.get('/api/leave-requests/analytics', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find(); // Fetch all leave requests
    
    // Group leave requests by department
    const departmentData = await LeaveRequest.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    res.status(200).json({ departmentData, leaveRequests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave request data', error });
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
