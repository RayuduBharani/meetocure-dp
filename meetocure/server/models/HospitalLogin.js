const mongoose = require('mongoose');

const hospitalLoginSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hospitalName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    hospitalImage: { type: String },
    docters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
}, { timestamps: true });

module.exports = mongoose.model('HospitalLogin', hospitalLoginSchema);
