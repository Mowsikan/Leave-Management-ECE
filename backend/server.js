const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Setup transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mowsikan02@gmail.com', // your email
    pass: 'yvtd pwxb iscn lzwl',  // your email password
  },
});

// Function to send an email
const sendEmail = (recipient, subject, text) => {
  const mailOptions = {
    from: 'mowsikan02@gmail.com',
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

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Leave-Management');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends timestamp to prevent file name conflicts
  },
});

const upload = multer({ storage });

// Leave request schema and model
const LeaveRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  reason: { type: String, required: true },
  proof: { type: String },
  date: { type: Date, required: true },
  status: { type: String, default: 'Pending' },  // New field to track status
});

const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

// Test Route
app.get('/test', (req, res) => {
  res.send('Test route working!');
});

// Routes
// Submit leave request
app.post('/api/leave-request', upload.single('proof'), async (req, res) => {
  try {
    const { name, rollNo, department, yearOfStudy, reason, date } = req.body;
    const proof = req.file ? `/uploads/${req.file.filename}` : null; // Store relative path to the file

    const newLeaveRequest = new LeaveRequest({
      name,
      rollNo,
      department,
      yearOfStudy,
      reason,
      proof,
      date,
    });

    await newLeaveRequest.save();

    // Notify staff when a new request is submitted
    sendEmail('selvihari1337@gmail.com', 'New Leave/OD Request', `A new request has been submitted by ${name}. Please review it.`);

    res.status(201).json(newLeaveRequest);
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit leave request' });
  }
});

// Get leave requests
app.get('/api/leave-requests', async (req, res) => {
  const { status } = req.query;
  try {
    const query = status ? { status } : {}; // If status query exists, filter by status
    const leaveRequests = await LeaveRequest.find(query);
    res.status(200).json(leaveRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Forward request to HOD and send email to student
app.put('/api/forward-leave/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);

    // Update the status of the leave request
    await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'Forwarded to HOD' });

    // Notify HOD and student when the request is forwarded
    sendEmail('mowsikan08@gmail.com', 'Leave/OD Request Forwarded', `A leave/OD request has been forwarded by staff.`);
    sendEmail(request.name, 'Leave/OD Request Forwarded', 'Your leave/OD request has been forwarded to HOD.');

    // Send an email notification to the student
    sendEmail(
      'selvihari2006@gmail.com',  // Replace with the student's email address
      'Leave Request Forwarded',
      `Your leave request has been forwarded to HOD for approval.`
    );

    res.status(200).send('Leave request forwarded to HOD and email sent to student.');
  } catch (error) {
    res.status(500).send('Error forwarding leave request and sending email.');
  }
});
// Accept the leave request (either staff or HOD)
app.put('/api/accept-leave/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);

    if (request.status === 'Pending') {
      await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'Forwarded to HOD' });
      // Notify HOD
      sendEmail('mowsikan08@gmail.com', 'Leave/OD Request Forwarded', `A leave/OD request has been forwarded by staff.`);
    } else if (request.status === 'Forwarded to HOD') {
      await LeaveRequest.findByIdAndDelete(req.params.id); // Delete after final approval
      // Notify student of acceptance
      sendEmail(request.name, 'Leave/OD Request Approved', 'Your leave/OD request has been approved by the HOD.');
    }

    res.status(200).send('Leave request accepted.');
  } catch (error) {
    res.status(500).send('Error accepting leave request.');
  }
});

// Reject the leave request
app.post('/api/leave/reject/:id', async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    
    if (request) {
      await LeaveRequest.findByIdAndDelete(req.params.id); // Delete the rejected request

      // Send an email notification to the student
    sendEmail(
      'selvihari2006@gmail.com',  // Replace with the student's email address
      'Leave Request rejected',
      `Your leave request has been rejected.`
    );

      res.status(200).send({ message: 'Leave request rejected.' });
    } else {
      res.status(404).send({ error: 'Leave request not found.' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Error rejecting leave request.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
