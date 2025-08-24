const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema (
{
    doctor:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },

    date:
    {
        type: String,
        required: true
    },

    availableSlots:
    [
        {
            type: String,
            required: true,
        },
    ],
},
{timestamps: true});

slotSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Slot", slotSchema);
