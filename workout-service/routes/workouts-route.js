const express = require('express');
const { check } = require('express-validator');

const workoutsControllers = require('../controllers/workouts-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/user', workoutsControllers.getWorkoutsByUserId);

router.post(
    '/',
    [
        check('type')
            .not()
            .isEmpty(),
        check('steps').isInt({ min: 0 }),
        check('distance').isInt({ min: 0 }),
        check('duration').isInt({ min: 0 }),
        //.withMessage('Duration must be equal to or greater than 0'),
        check('caloriesBurned').isInt({ min: 0 }),
        //.withMessage('Duration must be equal to or greater than 0')
        check('startedOn').not()
            .isEmpty()
            //.withMessage('Datetime is required')
            .isISO8601().withMessage('Invalid datetime format for startedOn'),
        check('endedOn').not()
            .isEmpty()
            //.withMessage('Datetime is required')
            .isISO8601().withMessage('Invalid datetime format for endedOn')
    ],
    workoutsControllers.createWorkout
);


module.exports = router;