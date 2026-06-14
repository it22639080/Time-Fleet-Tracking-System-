const mongoose = require('mongoose');

const alertLocationSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  {
    _id: false
  }
);

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['geofence_enter', 'geofence_exit', 'overspeed', 'offline', 'system'],
      required: true,
      index: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      index: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: alertLocationSchema
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Backward-compatible references reserved for older alert code.
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      index: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }
  },
  {
    timestamps: true
  }
);

alertSchema.pre('validate', function syncAlertCompatibilityFields(next) {
  this.vehicle = this.vehicle || this.vehicleId;
  this.driver = this.driver || this.driverId;
  this.vehicleId = this.vehicleId || this.vehicle;
  this.driverId = this.driverId || this.driver;

  return next();
});

alertSchema.index({ createdAt: -1 });
alertSchema.index({ vehicle: 1, createdAt: -1 });
alertSchema.index({ driver: 1, createdAt: -1 });
alertSchema.index({ trip: 1, createdAt: -1 });
alertSchema.index({ isRead: 1, createdAt: -1 });
alertSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
