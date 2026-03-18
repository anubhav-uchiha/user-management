const checkBlockedUser = async (user) => {
  if (!user.isBlocked) return { blocked: false };

  if (!user.blockedUntil) {
    return {
      blocked: true,
      status: 403,
      message: "User permanently blocked",
    };
  }

  if (user.blockedUntil > new Date()) {
    return {
      blocked: true,
      status: 403,
      message: `User blocked until ${user.blockedUntil}`,
    };
  }

  // expired block (NO DB WRITE HERE)
  return { blocked: false, expired: true };
};

module.exports = checkBlockedUser;
