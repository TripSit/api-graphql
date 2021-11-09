'use strict';

module.exports = function discordAccountResolver(dbRecord, apiRes) {
  return {
    id: dbRecord.id,
    userId: dbRecord.userId,
    isBot: apiRes.bot,
    avatar: apiRes.avatar,
    username: apiRes.username,
    joinedAt: new Date(apiRes.createdAt),
    createdAt: new Date(dbRecord.createdAt),
  };
};
