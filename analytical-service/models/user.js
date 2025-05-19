const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  gender: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  height: { type: Number, required: false },
  weight: { type: Number, required: false },
  workouts: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Workout' }],
  moveGoals: [{ type: mongoose.Types.ObjectId, required: true, ref: 'MoveGoal' }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
