const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const MoveGoal = require('../models/move-goal');
const User = require('../models/user');

const getMoveGoalsByUserId = async (req, res, next) => {
    const userId = req.userData.userId;
    let userWithMoveGoals;
    try {
        userWithMoveGoals = await User.findById(userId).populate('moveGoals');
    } catch (err) {
        const error = new HttpError(
            'Fetching move goals failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!userWithMoveGoals || userWithMoveGoals.moveGoals.length === 0) {
        // return next(
        //     new HttpError('Could not find move goals for the provided user id.', 404)
        // );
        return res.json({moveGoals: []});
    }

    res.json({
        moveGoals: userWithMoveGoals.moveGoals.map(moveGoal =>
            moveGoal.toObject({ getters: true })
        )
    });
}

const createMoveGoal = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const allErrors = errors.array().map(err => {
            return 'Field: ' + err.param + ' Message: ' + err.msg;
        });
        return next(
            new HttpError(allErrors, 400)
        );
    }

    const { type, targetValue } = req.body;
    const userId = req.userData.userId;

    const createMoveGoal = new MoveGoal({
        type,
        targetValue,
        userId
    });

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError(
            'Creating move goal failed, please try again.',
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
        await createMoveGoal.save({ session: sess });
        user.moveGoals.push(createMoveGoal);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating move goal failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ moveGoal: createMoveGoal.toObject({getters: true}) });
}

const updateMoveGoal = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const allErrors = errors.array().map(err => {
            return 'Field: ' + err.param + ' Message: ' + err.msg;
        });
        return next(
            new HttpError(allErrors, 400)
        );
    }

    const { type, targetValue } = req.body;
    const moveGoalId = req.params.mid;

    let moveGoal;
    try {
        moveGoal = await MoveGoal.findById(moveGoalId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update move goal.',
            500
        );
        return next(error);
    }

    if (moveGoal.userId.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this move goal.', 401);
        return next(error);
    }

    moveGoal.type = type;
    moveGoal.targetValue = targetValue;

    try {
        await moveGoal.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update move goal.',
            500
        );
        return next(error);
    }

    res.status(200).json({ moveGoal: moveGoal.toObject({ getters: true }) });
}

exports.getMoveGoalsByUserId = getMoveGoalsByUserId;
exports.createMoveGoal = createMoveGoal;
exports.updateMoveGoal = updateMoveGoal;