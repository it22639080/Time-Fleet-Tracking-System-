const mongoose = require('mongoose');

const Alert = require('../models/alert.model');
const AppError = require('../utils/app-error');

function assertValidObjectId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400);
  }
}

function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function populateAlert(query) {
  return query
    .populate('vehicle', 'vehicleNumber vehicleType status')
    .populate('driver', 'name email phone role')
    .populate('trip', 'status startedAt endedAt');
}

async function createAlert(payload) {
  const alert = await Alert.create(payload);
  return populateAlert(Alert.findById(alert._id));
}

async function getAlerts(query = {}) {
  const filter = {};

  ['type', 'isRead', 'vehicle', 'driver', 'trip'].forEach((field) => {
    if (query[field] !== undefined) {
      filter[field] = field === 'isRead' ? query[field] === 'true' : query[field];
    }
  });

  const { page, limit, skip } = getPagination(query);
  const [alerts, total, unreadCount] = await Promise.all([
    populateAlert(Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Alert.countDocuments(filter),
    Alert.countDocuments({ isRead: false })
  ]);

  return {
    alerts,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function markAlertRead(alertId) {
  assertValidObjectId(alertId, 'alert id');

  const alert = await populateAlert(
    Alert.findByIdAndUpdate(alertId, { isRead: true }, { new: true, runValidators: true })
  );

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  return alert;
}

async function markAllAlertsRead() {
  const result = await Alert.updateMany({ isRead: false }, { isRead: true });

  return {
    modifiedCount: result.modifiedCount
  };
}

module.exports = {
  createAlert,
  getAlerts,
  markAlertRead,
  markAllAlertsRead
};
