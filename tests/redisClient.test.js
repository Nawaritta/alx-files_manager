import { expect } from 'chai';
import redisClient from '../utils/redis';

describe('redisClient', () => {
    before(async () => {
        await redisClient.client.flushall('ASYNC');
    });

    after(async () => {
       await redisClient.client.flushall('ASYNC');
    });

    it('should connect to Redis', () => {
        expect(redisClient.isAlive()).to.be.true;
    });

    it('should set and get values from Redis', async () => {

        await redisClient.set('testKey', 'testValue', 10);
        const value = await redisClient.get('testKey');
        expect(value).to.equal('testValue');
    });

    it('delete key can be called without issue', async () => {
        const key = 'ToDelete';
        await redisClient.set(key, 'value', 1);
        const result = await redisClient.del(key);
        expect(result).to.equal(true);
    });


});
