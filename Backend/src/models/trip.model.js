const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true
    }
  },
  {
    _id: false
  }
);

const routePointSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
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
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const tripSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    startLocation: {
      type: coordinateSchema
    },
    endLocation: {
      type: coordinateSchema
    },
    routePoints: {
      type: [routePointSchema],
      default: []
    },
    startedAt: {
      type: Date
    },
    endedAt: {
      type: Date
    },
    distance: {
      type: Number,
      min: 0,
      default: 0
    },
    duration: {
      type: Number,
      min: 0,
      default: 0
    },
    averageSpeed: {
      type: Number,
      min: 0,
      default: 0
    },

    // Backward-compatible references reserved for earlier services.
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      index: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }
  },
  {
    timestamps: true
  }
);

tripSchema.pre('validate', function syncTripCompatibilityFields(next) {
  this.vehicle = this.vehicle || this.vehicleId;
  this.driver = this.driver || this.driverId;
  this.user = this.user || this.userId;

  this.vehicleId = this.vehicleId || this.vehicle;
  this.driverId = this.driverId || this.driver;
  this.userId = this.userId || this.user;

  return next();
});

tripSchema.index({ status: 1, createdAt: -1 });
tripSchema.index({ vehicle: 1, status: 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ startedAt: -1 });
tripSchema.index({ 'routePoints.timestamp': -1 });

module.exports = mongoose.model('Trip', tripSchema);
