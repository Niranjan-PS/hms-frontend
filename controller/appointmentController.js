import Appointment  from '../model/Appointment.js';
import Doctor   from'../model/Doctor.js'
import asyncHandler from '../middlewares/asyncHandler.js';
import  moment from'moment-timezone'

// Helper function to check doctor availability
// Helper function to convert time string (e.g., "09:00") to minutes for comparison
// Helper function to convert time string (e.g., "09:00") to minutes for comparison



// Helper function to convert time string (e.g., "09:00") to minutes for comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to check doctor availability
const checkDoctorAvailability = async (doctorId, appointmentDate) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.availability) {
    console.log('checkDoctorAvailability - Doctor not found or no availability:', doctorId);
    return { isAvailable: false, error: 'Doctor not found or has no availability' };
  }

  // Log the raw appointment date in UTC
  console.log('checkDoctorAvailability - Raw Appointment Date (UTC):', appointmentDate);

  // Convert appointment date to IST using moment-timezone
  const appointmentDateIST = moment(appointmentDate).tz('Asia/Kolkata');

  // Calculate day of week and time in IST
  const dayOfWeek = appointmentDateIST.format('dddd'); // e.g., "Tuesday"
  const appointmentTime = appointmentDateIST.format('HH:mm'); // e.g., "22:30"

  console.log('checkDoctorAvailability - Day of Week (IST):', dayOfWeek);
  console.log('checkDoctorAvailability - Appointment Time (IST):', appointmentTime);

  const availability = doctor.availability.find(slot => slot.day === dayOfWeek);
  if (!availability) {
    console.log('checkDoctorAvailability - No availability for day:', dayOfWeek);
    return { isAvailable: false, error: `Doctor is not available on ${dayOfWeek}.` };
  }

  const appointmentMinutes = timeToMinutes(appointmentTime);
  const startMinutes = timeToMinutes(availability.startTime);
  const endMinutes = timeToMinutes(availability.endTime);

  console.log('checkDoctorAvailability - Availability:', availability);
  console.log('checkDoctorAvailability - Appointment Minutes:', appointmentMinutes, 'Start:', startMinutes, 'End:', endMinutes);

  if (appointmentMinutes < startMinutes || appointmentMinutes >= endMinutes) {
    return {
      isAvailable: false,
      error: `Doctor is not available at the specified time. Available hours on ${dayOfWeek}: ${availability.startTime} to ${availability.endTime} (IST).`,
    };
  }

  return { isAvailable: true };
};

export const createAppointment = async (req, res) => {
  try {
    console.log('Create Appointment - Request Body:', req.body);
    console.log('Create Appointment - req.user:', req.user);
    console.log('Create Appointment - req.patient:', req.patient);

    // Check if req.user is defined
    if (!req.user || !req.user._id) {
      console.log('Create Appointment - No authenticated user');
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { doctor, date, reason } = req.body;
    if (!doctor || !date || !reason) {
      console.log('Create Appointment - Missing required fields');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate doctor
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      console.log('Create Appointment - Doctor not found:', doctor);
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Patient validation (already done by middleware, just confirm req.patient exists)
    if (!req.patient) {
      console.log('Create Appointment - Patient not found for user ID:', req.user._id);
      return res.status(404).json({ success: false, error: 'Patient profile not found for authenticated user' });
    }

    // Parse the appointment date (assumed to be in UTC)
    const appointmentDate = new Date(date);
    const currentDate = new Date();
    console.log('Create Appointment - Appointment Date (UTC):', appointmentDate);
    console.log('Create Appointment - Current Date (UTC):', currentDate);

    // Check if the appointment is in the past
    if (appointmentDate < currentDate) {
      console.log('Create Appointment - Appointment date is in the past');
      return res.status(400).json({
        success: false,
        error: 'Cannot schedule an appointment in the past.',
      });
    }

    // Check doctor's availability
    const availabilityCheck = await checkDoctorAvailability(doctor, appointmentDate);
    if (!availabilityCheck.isAvailable) {
      return res.status(400).json({ success: false, error: availabilityCheck.error });
    }

    // Check for overlapping appointments (within a 30-minute window)
    const overlappingAppointments = await Appointment.find({
      doctor,
      date: {
        $gte: new Date(appointmentDate.getTime() - 15 * 60 * 1000), // 15 minutes before
        $lte: new Date(appointmentDate.getTime() + 15 * 60 * 1000), // 15 minutes after
      },
      status: { $ne: 'cancelled' },
    });

    if (overlappingAppointments.length > 0) {
      console.log('Create Appointment - Overlapping appointments found:', overlappingAppointments);
      return res.status(400).json({
        success: false,
        error: 'Doctor has another appointment at this time.',
      });
    }

    // Create the appointment
    console.log('Create Appointment - Setting patient ID:', req.user._id);
    const appointment = new Appointment({
      patient: req.patient._id, // Correct: Use Patient ID
      doctor,
      date: appointmentDate,
      reason,
      status: 'pending',
    });

    const savedAppointment = await appointment.save();
    console.log('Create Appointment - Saved Appointment:', savedAppointment);

    // Populate patient and doctor details
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'department');
    console.log('Create Appointment - Populated Appointment:', populatedAppointment);

    res.status(201).json({
      success: true,
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Create Appointment - Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Get all appointments (filtered by role)
// @route   GET /api/appointments
// @access  Private

export const getAppointments = async (req, res) => {
  try {
    console.log('Get Appointments - req.user:', req.user);
    console.log('Get Appointments - req.patient:', req.patient);

    if (!req.patient || !req.patient._id) {
      console.log('Get Appointments - Patient not found for user ID:', req.user._id);
      return res.status(404).json({ success: false, error: 'Patient profile not found for authenticated user' });
    }

    console.log('Get Appointments - Querying with patient ID:', req.patient._id);
    const appointments = await Appointment.find({ patient: req.patient._id });
    console.log('Get Appointments - Appointments before population:', appointments);

    const populatedAppointments = await Appointment.find({ patient: req.patient._id })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      });

    const validAppointments = populatedAppointments.filter(
      appointment => appointment.patient && appointment.doctor
    );

    console.log('Get Appointments - Fetched appointments:', validAppointments);
    res.json(validAppointments);
  } catch (error) {
    console.error('Get Appointments - Error:', error.message);
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email')
    .populate('doctor', 'name department');
    console.log("this is the appointment",appointment)

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check access
  if (
    req.user.role !== 'admin' &&
    appointment.patient._id.toString() !== req.user._id.toString() &&
    appointment.doctor.user?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Unauthorized');
  }

  res.json(appointment);
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check access
  if (
    req.user.role !== 'admin' &&
    appointment.patient._id.toString() !== req.user._id.toString() &&
    appointment.doctor.user?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Unauthorized');
  }

  const { date, reason, status } = req.body;

  // Validate doctor availability if date changes
  if (date && date !== appointment.date.toISOString()) {
    const isAvailable = await checkDoctorAvailability(appointment.doctor, new Date(date));
    if (!isAvailable) {
      res.status(400);
      throw new Error('Doctor is not available at the specified time');
    }

    // Check for conflicting appointments
     const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointment._id },
    });
    if (conflictingAppointment) {
      res.status(400);
      throw new Error('Doctor already has an appointment at this time');
    }
  }

  // Restrict status changes
  if (status) {
    if (req.user.role === 'patient' && status !== 'cancelled') {
      res.status(403);
      throw new Error('Patients can only cancel appointments');
    }
    if (req.user.role === 'doctor' && !['confirmed', 'completed', 'cancelled'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status for doctor');
    }
  }

  appointment.date = date ? new Date(date) : appointment.date;
  appointment.reason = reason || appointment.reason;
  appointment.status = status || appointment.status;

  const updatedAppointment = await appointment.save();
  res.json(updatedAppointment);
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Check access
  if (
    req.user.role !== 'admin' &&
    appointment.patient._id.toString() !== req.user._id.toString() &&
    appointment.doctor.user?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Unauthorized');
  }

  appointment.status = 'cancelled';
  await appointment.save();
  res.json({ message: 'Appointment cancelled' });
});

