const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Create prescription
router.post('/', prescriptionController.createPrescription);

// Get prescription by appointment
router.get('/appointment/:appointmentId', prescriptionController.getPrescriptionByAppointment);

// Get all prescriptions for a patient
router.get('/patient/:patientId', prescriptionController.getPrescriptionsByPatient);

// Update prescription by ID
router.put('/:id', prescriptionController.updatePrescription);

module.exports = router; 