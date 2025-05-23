import express from 'express';
 const router = express.Router();
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
} from '../controller/appointmentController.js'
import  authMiddleware  from '../middlewares/auth.js'

router.use(authMiddleware); // Protect all routes

router.route('/')
  .post(createAppointment)
  .get(getAppointments);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(cancelAppointment);


export default router;