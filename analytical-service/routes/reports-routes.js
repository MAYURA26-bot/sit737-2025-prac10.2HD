const express = require('express');

const reportsControllers = require('../controllers/reports-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/user/workout-report', reportsControllers.getWorkoutReportByUserId);
router.get('/user/goal-progress', reportsControllers.getGoalProgressReportByUserId);

module.exports = router;