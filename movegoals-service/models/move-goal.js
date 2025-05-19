const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const moveGoalSchema = new Schema({
    type: {type: String, required: true},
    targetValue: { type: Number, required: true },
    createdOn: { type: Date, default: Date.now },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('MoveGoal', moveGoalSchema);