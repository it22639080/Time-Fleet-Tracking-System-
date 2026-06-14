const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

locationHistorySchema.index({ vehicleId: 1, timestamp: -1 });
locationHistorySchema.index({ timestamp: -1 });
locationHistorySchema.index({ vehicleId: 1, createdAt: -1 });

module.exports = mongoose.model('LocationHistory', locationHistorySchema);
