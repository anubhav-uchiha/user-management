const cron = require("node-cron");
const User = require("../models/userModel.js");

const startUnblockCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await User.updateMany(
        {
          isBlocked: true,
          blockedUntil: { $ne: null, $lte: new Date() },
        },
        {
          $set: {
            isBlocked: false,
            blockedUntil: null,
          },
        },
      );
      await User.updateMany(
        {
          isBlocked: false,
          blockedUntil: { $ne: null },
        },
        {
          $set: { blockedUntil: null },
        },
      );
      if (result.modifiedCount > 0) {
        console.log(`Auto-unblocked ${result.modifiedCount} users`);
      }
    } catch (error) {
      console.error("Cron error:", error.message);
    }
  });
};

module.exports = startUnblockCron;
