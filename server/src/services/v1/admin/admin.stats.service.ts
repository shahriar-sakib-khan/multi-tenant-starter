/**
 * @module admin.stats.service
 *
 * @description Services for admin-related application statistics.
 */

import { User } from '@/models';

/**
 * @function getApplicationStats
 * @description Retrieves total number of users in the system.
 *
 * @returns {Promise<{ totalUsers: number }>} Total users count.
 */
export const getApplicationStats = async (): Promise<{ totalUsers: number }> => {
  const totalUsers: number = await User.countDocuments();
  return { totalUsers };
};

/**
 * @function getActiveUsersStats
 * @description Retrieves count of users with active status.
 *
 * @returns {Promise<{ activeUsers: number }>} Active users count.
 */
export const getActiveUsersStats = async (): Promise<{ activeUsers: number }> => {
  const activeUsers: number = await User.countDocuments({ status: 'active' });
  return { activeUsers };
};

/**
 * @function getUsersByRole
 * @description Retrieves number of users grouped by their roles.
 *
 * @returns {Promise<Record<string, number>>} Object mapping role -> count.
 */
export const getUsersByRole = async (): Promise<Record<string, number>> => {
  const usersByRole = await User.aggregate([
    { $unwind: '$roles' },
    { $group: { _id: '$roles', count: { $sum: 1 } } },
  ]);

  const result: Record<string, number> = {};
  usersByRole.forEach(group => {
    result[group._id] = group.count;
  });

  return result;
};

/**
 * @function getUserRegistrationTrends
 * @description Retrieves user registration trends over the last N days.
 *
 * @param {number} days - Number of days to look back (default 30).
 * @returns {Promise<Record<string, number>>} Map of date string -> registrations count.
 */
export const getUserRegistrationTrends = async (
  days = 30
): Promise<Record<string, number>> => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const trends = await User.aggregate([
    { $match: { createdAt: { $gte: fromDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const result: Record<string, number> = {};
  trends.forEach(item => {
    result[item._id] = item.count;
  });

  return result;
};

export default {
  getApplicationStats, // Counts total users from DB
  getActiveUsersStats, // Counts active users from DB
  getUsersByRole, // Aggregates users grouped by roles from DB
  getUserRegistrationTrends, // Aggregates user registrations by date over N days
};
