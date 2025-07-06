const Prescription = require('../models/Prescription');

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointment, therapist, patient, notes } = req.body;
    const prescription = new Prescription({ appointment, therapist, patient, notes });
    await prescription.save();
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get prescription by appointment
exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const prescription = await Prescription.findOne({ appointment: appointmentId })
      .populate('therapist', 'name')
      .populate('patient', 'name');
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all prescriptions for a patient
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('therapist', 'name')
      .populate('appointment');
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update prescription by ID
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { notes },
      { new: true, runValidators: true }
    );
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; 