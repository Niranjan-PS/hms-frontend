import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnosedAt: { type: Date, required: true },
        notes: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema)