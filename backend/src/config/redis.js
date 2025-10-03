const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15951.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 15951
    }
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);
});

module.exports = redisClient;