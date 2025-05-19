const cron = require('node-cron');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const Workout = require('../models/workout');
const MoveGoal = require('../models/move-goal');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//04:58 pm
cron.schedule('58 16 * * *', async () => {
    console.log('Running daily missed-goal notification job...');

    const goals = await MoveGoal.aggregate([
        {
            $sort: { createdOn: -1 }
        },
        {
            $group: {
                _id: "$userId",
                targetValue: { $first: "$targetValue" }
            }
        }
    ]);

    for (const goalEntry of goals) {
        console.log(goalEntry);
        const userId = goalEntry._id;
        const target = goalEntry.targetValue;

        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);

        const summary = await Workout.aggregate([
            { $match: { userId, startedOn: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalCaloriesBurned: { $sum: "$caloriesBurned" } } }
        ]);

        const caloriesBurned = summary[0]?.totalCaloriesBurned || 0;

        if (caloriesBurned >= target) continue;

        const user = await User.findById(userId);
        if (!user) continue;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'You Missed Your Calorie Goal Yesterday',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #ff6b6b;">Missed Your Goal</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Yesterday (${start.toDateString()}), you burned <strong style="color: #ff6b6b;">${caloriesBurned} cal</strong> but your target was <strong>${target} cal</strong>.</p>
          <p>Let’s aim higher today — you got this!</p>
        </div>
      `
        });
    }
});