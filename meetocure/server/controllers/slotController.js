const Slot = require("../models/Slot");

const setDoctorSlots = async (req, res) => 
{
  try 
  {
    const { date, availableSlots } = req.body;

    const existing = await Slot.findOne({ doctor: req.user.id, date });

    if (existing) 
    {
      existing.availableSlots = availableSlots;
      await existing.save();
      return res.json({ message: "Slots updated", slot: existing });
    }

    const slot = new Slot(
    {
      doctor: req.user.id,
      date,
      availableSlots,
    });

    await slot.save();
    res.status(201).json({ message: "Slots created", slot });
  } 
  catch (err) 
  {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorSlots = async (req, res) => 
{
  try 
  {
    const slots = await Slot.find({ doctor: req.user.id }).sort({ date: 1 });
    res.json(slots);
  } 
  catch (err) 
  {
    res.status(500).json({ message: err.message });
  }
};

const getSlotsByDoctorId = async (req, res) => 
{
  try 
  {
    const { doctorId } = req.params;
    const slots = await Slot.find({ doctor: doctorId }).sort({ date: 1 });
    res.json(slots);
  } 
  catch (err) 
  {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  setDoctorSlots,
  getDoctorSlots,
  getSlotsByDoctorId,
};
