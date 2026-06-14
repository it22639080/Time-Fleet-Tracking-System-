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
      required: true
    }
  },
  {
    _id: false
  }
);

const locationPointSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      index: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
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
    accuracy: {
      type: Number,
      min: 0
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    location: {
      type: pointSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

locationPointSchema.pre('validate', function setGeoPoint(next) {
  this.location = {
    type: 'Point',
    coordinates: [this.lng, this.lat]
  };

  return next();
});

locationPointSchema.index({ vehicle: 1, timestamp: -1 });
locationPointSchema.index({ trip: 1, timestamp: 1 });
locationPointSchema.index({ driver: 1, timestamp: -1 });
locationPointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LocationPoint', locationPointSchema);
