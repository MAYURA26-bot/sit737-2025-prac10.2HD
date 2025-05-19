const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Workout = require('../models/workout');
const User = require('../models/user');


const getWorkoutsByUserId = async (req, res, next) => {
    const userId = req.userData.userId;
    let userWithWorkouts;
    try {
        userWithWorkouts = await User.findById(userId).populate('workouts');
    } catch (err) {
        const error = new HttpError(
            'Fetching move goals failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!userWithWorkouts || userWithWorkouts.workouts.length === 0) {
        // return next(
        //     new HttpError('Could not find move goals for the provided user id.', 404)
        // );
        return res.json({workouts: []});
    }

    res.json({
        workouts: userWithWorkouts.workouts.sort((a, b) => b.createdOn - a.createdOn).map(workout =>
            workout.toObject({ getters: true })
        )
    });
}

const createWorkout = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const allErrors = errors.array().map(err => {
            return 'Field: ' + err.param + ' Message: ' + err.msg;
        });
        return next(
            new HttpError(allErrors, 400)
        );
    }

    const { type, steps, distance, duration, caloriesBurned, startedOn, endedOn } = req.body;

    const createdWorkout = new Workout({
        type,
        steps,
        distance,
        duration,
        caloriesBurned,
        startedOn,
        endedOn,
        userId: req.userData.userId,
    });

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError(
            'Creating workout failed, please try again.',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdWorkout.save({ session: sess });
        user.workouts.push(createdWorkout);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating workout failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ workout: createdWorkout });
}

exports.createWorkout = createWorkout;
exports.getWorkoutsByUserId = getWorkoutsByUserId;