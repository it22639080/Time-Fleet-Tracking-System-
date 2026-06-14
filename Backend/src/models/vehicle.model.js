const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  {
    _id: false
  }
);

const lastKnownLocationSchema = new mongoose.Schema(
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
    },
    speed: {
      type: Number,
      min: 0,
      default: 0
    },
    heading: {
      type: Number,
      min: 0,
      max: 360,
      default: 0
    },
    timestamp: {
      type: Date
    },
    geo: {
      type: pointSchema,
      default: undefined
    }
  },
  {
    _id: false
  }
);

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    vehicleType: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'on_trip'],
      default: 'active',
      index: true
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    lastKnownLocation: {
      type: lastKnownLocationSchema,
      default: undefined
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    // Backward-compatible fields used by the existing driver/tracking services.
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.pre('validate', function syncVehicleCompatibilityFields(next) {
  if (this.driverId && !this.assignedDriver) {
    this.assignedDriver = this.driverId;
  }

  if (this.assignedDriver && !this.driverId) {
    this.driverId = this.assignedDriver;
  }

  if (this.isModified('status') && this.status) {
    this.isActive = this.status === 'active' || this.status === 'on_trip';
  }

  if (this.lastKnownLocation?.lat !== undefined && this.lastKnownLocation?.lng !== undefined) {
    this.lastKnownLocation.geo = {
      type: 'Point',
      coordinates: [this.lastKnownLocation.lng, this.lastKnownLocation.lat]
    };
  }

  return next();
});

vehicleSchema.index({ vehicleNumber: 1 }, { unique: true });
vehicleSchema.index({ status: 1, updatedAt: -1 });
vehicleSchema.index({ assignedDriver: 1, status: 1 });
vehicleSchema.index({ assignedUser: 1, status: 1 });
vehicleSchema.index({ driverId: 1, isActive: 1 });
vehicleSchema.index({ 'lastKnownLocation.timestamp': -1 });
vehicleSchema.index({ 'lastKnownLocation.geo': '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
