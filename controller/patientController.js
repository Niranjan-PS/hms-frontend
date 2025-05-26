import asyncHandler from '../middlewares/asyncHandler.js';
import Patient from '../model/Patient.js';

// @desc    Create a new patient profile
// @route   POST /api/patients
// @access  Private (patient or admin)
const createPatient = asyncHandler(async (req, res) => {
    console.log('Create patient request body:', req.body);
  const { dateOfBirth, gender, phone, address, medicalHistory } = req.body;

  // Validate input
  if (!dateOfBirth || !gender) {
    res.status(400);
    throw new Error('Date of birth and gender are required');
  }

  // Check if patient profile already exists for the user
  const existingPatient = await Patient.findOne({ user: req.user._id });
  if (existingPatient) {
    res.status(400);
    throw new Error('Patient profile already exists');
  }

  // Create patient profile
  const patient = await Patient.create({
    user: req.user._id,
    dateOfBirth,
    gender,
    phone,
    address,
    medicalHistory,
  });

  res.status(201).json(patient);
});

// @desc    Get patient profile by ID or current user
// @route   GET /api/patients/:id
// @access  Private (patient for own profile, admin for any)
const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('user', 'name email role');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Check if user is patient themselves or admin
  if (patient.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this profile');
  }

  res.status(200).json(patient);
});

// @desc    Get all patients (admin only)
// @route   GET /api/patients
// @access  Private (admin)
const getAllPatients = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized, admin access required'
      });
    }

    const patients = await Patient.find().populate('user', 'name email role');

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
});

// @desc    Update patient profile
// @route   PUT /api/patients/:id
// @access  Private (patient for own profile, admin for any)
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Check if user is patient themselves or admin
  if (patient.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }

  // Update fields
  patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth;
  patient.gender = req.body.gender || patient.gender;
  patient.phone = req.body.phone || patient.phone;
  patient.address = req.body.address || patient.address;
  patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory;

  const updatedPatient = await patient.save();
  res.status(200).json(updatedPatient);
});

// @desc    Delete patient profile
// @route   DELETE /api/patients/:id
// @access  Private (admin only)
const deletePatient = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized, admin access required'
      });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Patient profile deleted',
      patientId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting patient:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
});

export { createPatient, getPatient, getAllPatients, updatePatient, deletePatient };