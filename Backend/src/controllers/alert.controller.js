const alertService = require('../services/alert.service');
const asyncHandler = require('../utils/async-handler');

const getAlerts = asyncHandler(async (req, res) => {
  const result = await alertService.getAlerts(req.query);

  res.status(200).json(result);
});

const markAlertRead = asyncHandler(async (req, res) => {
  const alert = await alertService.markAlertRead(req.params.id);

  res.status(200).json({ alert });
});

const markAllAlertsRead = asyncHandler(async (_req, res) => {
  const result = await alertService.markAllAlertsRead();

  res.status(200).json({
    message: 'All alerts marked as read',
    ...result
  });
});

module.exports = {
  getAlerts,
  markAlertRead,
  markAllAlertsRead
};
