const Availability = require("../models/Availability");
const Slot = require("../models/Slot");

const setAvailability = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;
    const { days } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    if (days.some(day => day.date < today)) {
      return res.status(400).json({ message: "Cannot add slots for past dates" });
    }

    // Fetch or create availability
    let availability = await Availability.findOne({ doctor: doctorId });

    if (!availability) {
      availability = await Availability.create({ doctor: doctorId, days });
    } else {
      // Merge or overwrite dates
      days.forEach((newDay) => {
        const existingDay = availability.days.find((d) => d.date === newDay.date);
        if (existingDay) {
          existingDay.slots = newDay.slots;
        } else {
          availability.days.push(newDay);
        }
      });
      await availability.save();
    }

    // 🧹 Clean old slots for this doctor
    await Slot.deleteMany({ doctor: doctorId });

    // 🧱 Build new slot documents
    const slotDocsMap = new Map();

availability.days.forEach(day => {
  if (!slotDocsMap.has(day.date)) {
    slotDocsMap.set(day.date, {
      doctor: doctorId,
      date: day.date,
      availableSlots: [...day.slots]
    });
  } else {
    // If date already added, merge the slots (optional safeguard)
    const existing = slotDocsMap.get(day.date);
    existing.availableSlots.push(...day.slots);
    slotDocsMap.set(day.date, existing);
  }
});

// Convert map to array
const slotDocs = Array.from(slotDocsMap.values());
await Slot.insertMany(slotDocs);

    res.status(200).json({ message: "Availability set and slots synced", availability });
  } catch (err) {
    console.error("Error in setAvailability:", err);
    res.status(500).json({ message: err.message });
  }
};

const getAvailability = async (req, res) => {
  console.log("testing the get avilability");
  try {
    const doctorId = req.params.doctorId;
    console.log(doctorId);

    const availability = await Availability.findOne({ doctor: doctorId });

    if (!availability) {
      return res.status(404).json({ message: "No availability set yet" });
    }

    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAvailabilityDate = async (req, res) => {
  console.log("testing delete availability date");
  const doctorId = req.user.doctorId;
  const { date } = req.params;

  const availability = await Availability.findOne({ doctor: doctorId });
  if (!availability) return res.status(404).json({ message: "No availability found" });

  availability.days = availability.days.filter((d) => d.date !== date);
  await availability.save();

  // Also delete slots for that date
  await Slot.deleteMany({ doctor: doctorId, date });

  res.json({ message: "Deleted", availability });
};

// New: update slots for a specific date (create if missing)
const updateAvailabilityDate = async (req, res) => {
  try {
    const doctorId = req.user?.doctorId;
    const { date } = req.params;
    const { slots } = req.body;

    if (!date || !Array.isArray(slots)) {
      return res.status(400).json({ message: "Invalid payload. Provide date param and slots array." });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (date < today) {
      return res.status(400).json({ message: "Cannot update slots for past dates" });
    }

    let availability = await Availability.findOne({ doctor: doctorId });
    if (!availability) {
      // create new availability doc with this single day
      availability = await Availability.create({
        doctor: doctorId,
        days: [{ date, slots }],
      });
    } else {
      const existingDay = availability.days.find((d) => d.date === date);
      if (existingDay) {
        existingDay.slots = slots;
      } else {
        availability.days.push({ date, slots });
      }
      await availability.save();
    }

    // Sync Slot collection for this date: remove old, insert new
    await Slot.deleteMany({ doctor: doctorId, date });
    if (slots.length > 0) {
      await Slot.create({
        doctor: doctorId,
        date,
        availableSlots: slots,
      });
    }

    return res.status(200).json({ message: "Availability updated", availability });
  } catch (err) {
    console.error("Error in updateAvailabilityDate:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  setAvailability,
  getAvailability,
  deleteAvailabilityDate,
  updateAvailabilityDate,
};
