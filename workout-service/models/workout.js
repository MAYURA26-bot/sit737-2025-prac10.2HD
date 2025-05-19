const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workoutSchema = new Schema({
    type: {type: String, required: true},
    steps: { type: Number, required: true },
    distance: { type: Number, required: true }, // in meters
    duration: { type: Number, required: true }, // in seconds
    caloriesBurned: { type: Number, required: true },
    startedOn: { type: Date, default: Date.now },
    endedOn: { type: Date, default: Date.now },
    createdOn: { type: Date, default: Date.now },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Workout', workoutSchema);