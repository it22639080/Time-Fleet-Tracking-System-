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

const polygonSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]],
      default: undefined
    }
  },
  {
    _id: false
  }
);

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
    }
  },
  {
    _id: false
  }
);

const geoFenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['circle', 'polygon'],
      default: 'circle',
      index: true
    },
    center: {
      type: coordinateSchema
    },
    radius: {
      type: Number,
      min: 1
    },
    polygonCoordinates: {
      type: [coordinateSchema],
      default: []
    },
    alertOnEnter: {
      type: Boolean,
      default: true
    },
    alertOnExit: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    centerPoint: {
      type: pointSchema,
      default: undefined
    },
    polygon: {
      type: polygonSchema,
      default: undefined
    },

    // Backward-compatible name used by the earlier geofence service.
    radiusMeters: {
      type: Number,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

geoFenceSchema.pre('validate', function setGeoFenceGeometry(next) {
  if (this.radius && !this.radiusMeters) {
    this.radiusMeters = this.radius;
  }

  if (this.radiusMeters && !this.radius) {
    this.radius = this.radiusMeters;
  }

  if (this.center?.lat !== undefined && this.center?.lng !== undefined) {
    this.centerPoint = {
      type: 'Point',
      coordinates: [this.center.lng, this.center.lat]
    };
  }

  if (this.type === 'polygon' && this.polygonCoordinates?.length) {
    const ring = this.polygonCoordinates.map((point) => [point.lng, point.lat]);
    const first = ring[0];
    const last = ring[ring.length - 1];

    if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
      ring.push(first);
    }

    this.polygon = {
      type: 'Polygon',
      coordinates: [ring]
    };
  }

  return next();
});

geoFenceSchema.index({ isActive: 1, updatedAt: -1 });
geoFenceSchema.index({ type: 1, isActive: 1 });
geoFenceSchema.index({ createdBy: 1, createdAt: -1 });
geoFenceSchema.index({ centerPoint: '2dsphere' }, { sparse: true });
geoFenceSchema.index({ polygon: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('GeoFence', geoFenceSchema);
