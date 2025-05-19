const express = require('express');
const { check } = require('express-validator');

const moveGoalsControllers = require('../controllers/move-goals-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/user', moveGoalsControllers.getMoveGoalsByUserId);

router.post(
    '/',
    [
        check('type')
            .not()
            .isEmpty(),
        check('targetValue').isInt({ min: 0 }),
    ],
    moveGoalsControllers.createMoveGoal
);

router.patch(
    '/:mid',
    [
        check('type')
            .not()
            .isEmpty(),
        check('targetValue').isInt({ min: 0 }),
    ],
    moveGoalsControllers.updateMoveGoal
);

module.exports = router;