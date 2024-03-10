import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.dbClient.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    const result = await dbClient.dbClient.collection('users').insertOne({ email, password: hashedPassword });
    return res.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');

    const userId = await redisClient.get(`auth_${token}`);
    console.log(userId)
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.dbClient.collection('users').findOne({ _id: new ObjectId(userId) });
    return res.json({ id: user.id, email: user.email });
  }
};

export default UsersController;
