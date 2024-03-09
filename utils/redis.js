import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.error(error);
    });
  }

  isAlive() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.client.connected);
      }, 1000);
    });
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, _reject) => {
      this.client.del(key, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
