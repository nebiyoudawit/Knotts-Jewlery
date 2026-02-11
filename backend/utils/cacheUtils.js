import redisClient from './redisClient.js';

export const invalidateDashboardCache = async () => {
  try {
    // Delete ALL dashboard-related cache keys
    const keys = await redisClient.keys('dashboard:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated dashboard cache keys: ${keys.join(', ')}`);
    }
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