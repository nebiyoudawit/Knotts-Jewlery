import redisClient from './redisClient.js';

export const invalidateDashboardCache = async () => {
  try {
    await redisClient.del('dashboard:stats');
  } catch (err) {
    console.error('Failed to invalidate dashboard cache:', err);
  }
};

export const invalidateAdminProductList = async () => {
  try {
    await redisClient.del('admin:products');
  } catch (err) {
    console.error('Failed to invalidate product list cache:', err);
  }
};

export const invalidateAdminUserList = async () => {
  try {
    await redisClient.del('admin:users');
  } catch (err) {
    console.error('Failed to invalidate user list cache:', err);
  }
};

export const invalidateAdminOrderList = async () => {
  try {
    await redisClient.del('admin:orders');
  } catch (err) {
    console.error('Failed to invalidate order list cache:', err);
  }
};
