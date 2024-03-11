import redisClient from './utils/redis';

(async () => {
    setTimeout(async () => {
        console.log(redisClient.isAlive());
        console.log(await redisClient.get('myKey'));
        await redisClient.set('myKey', 12, 5);
        console.log(await redisClient.get('myKey'));

        setTimeout(async () => {
            console.log(await redisClient.get('myKey'));
        }, 1000*10)
    }, 1000); // 1 sec delay waiting for redis to start
})();
