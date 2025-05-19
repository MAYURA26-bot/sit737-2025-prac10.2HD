const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Workout = require('../models/workout');
const MoveGoal = require('../models/move-goal');

const getWorkoutReportByUserId = async(req, res, next) => {
    const userId = req.userData.userId;
    const {from, to} = req.query;

    if (!from || !to) {
        const error = new HttpError(
            'Missing from or to query parameters',
            400
        );
        return next(error);
    }

    try {
        const monUserId = new mongoose.Types.ObjectId(req.userData.userId);
        const fromDate = new Date(from);
        const toDate = new Date(to);

        const dailyCalories = await Workout.aggregate([
            {
                $match: {
                    startedOn: {
                        $gte: fromDate,
                        $lte: toDate
                    },   
                    userId: monUserId,
                }
            },
            {
                $group: {
                    _id: null,
                    totalCaloriesBurned: {$sum: "$caloriesBurned"},
                    totalSteps: {$sum: "$steps"},
                    totalDistance: {$sum: "$distance"}
                }
            }
        ]);

        let totalCaloriesBurned = 0, totalSteps = 0, totalDistance = 0;

        if (dailyCalories.length > 0) {
            totalCaloriesBurned = dailyCalories[0].totalCaloriesBurned;
            totalSteps = dailyCalories[0].totalSteps;
            totalDistance = dailyCalories[0].totalDistance;
        }

        const moveGoal = await MoveGoal.findOne({userId: monUserId}).sort({ createdOn: -1 });

        let remainingCaloriesToBurn = 0;

        if (moveGoal) {
            const fromMidnight = new Date(fromDate.setHours(0, 0, 0, 0));
            const toMidnight = new Date(toDate.setHours(0, 0, 0, 0));
            const diffTime = Math.abs(toMidnight - fromMidnight);
            const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
            totalTargetCalories = moveGoal.targetValue * totalDays;
            remainingCaloriesToBurn = totalTargetCalories - totalCaloriesBurned;
        }

        res.status(200).json({
            totalCaloriesBurned,
            totalSteps,
            totalDistance,
            remainingCaloriesToBurn
        });
    } catch (ex) {
        console.log(ex);
        const error = new HttpError(
            'Fetching report failed',
            500
        );
        return next(error);
    }
}

const getGoalProgressReportByUserId = async(req, res, next) => {
    const userId = req.userData.userId;
    const {from, to} = req.query;

    if (!from || !to) {
        const error = new HttpError(
            'Missing from or to query parameters',
            400
        );
        return next(error);
    }

    try {
        const monUserId = new mongoose.Types.ObjectId(req.userData.userId);
        const fromDate = new Date(from);
        const toDate = new Date(to);

        const dailyCalories = await Workout.aggregate([
            {
                $match: {
                    startedOn: {
                        $gte: fromDate,
                        $lte: toDate
                    },   
                    userId: monUserId,
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$startedOn" }
                    },
                    totalCaloriesBurned: {$sum: "$caloriesBurned"}
                    // totalSteps: {$sum: "$steps"},
                    // totalDistance: {$sum: "$distance"}
                },
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // let totalCaloriesBurned = 0, totalSteps = 0, totalDistance = 0;

        // if (dailyCalories.length > 0) {
        //     totalCaloriesBurned = dailyCalories[0].totalCaloriesBurned;
        //     totalSteps = dailyCalories[0].totalSteps;
        //     totalDistance = dailyCalories[0].totalDistance;
        // }

        console.log(dailyCalories);

        const moveGoal = await MoveGoal.findOne({userId: monUserId}).sort({ createdOn: -1 });
        const goalPerDay = moveGoal ? moveGoal.targetValue : 0;

        const result = [];
        const current = new Date(fromDate);

        while (current <= toDate) {
            const dateStr = current.toISOString().split('T')[0];
            const record = dailyCalories.find(d => d._id === dateStr);
            result.push({
                date: dateStr,
                caloriesBurned: record ? record.totalCaloriesBurned : 0,
                moveGoal: goalPerDay
            });
            current.setDate(current.getDate() + 1);
        }

        res.status(200).json({data: result});
    } catch (ex) {
        console.log(ex);
        const error = new HttpError(
            'Fetching report failed',
            500
        );
        return next(error);
    }
}

exports.getWorkoutReportByUserId = getWorkoutReportByUserId;
exports.getGoalProgressReportByUserId = getGoalProgressReportByUserId;