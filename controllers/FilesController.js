import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      name, type, isPublic, data, parentId,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    let parentFile;
    if (parentId) {
      parentFile = await dbClient.dbClient.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const folderData = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type === 'folder') {
      const newFolder = await dbClient.dbClient.collection('files').insertOne({
        userId, name, type, isPublic: isPublic || false, parentId: parentId || 0,
      });
      return res.status(201).json({ id: newFolder.insertedId, ...folderData });
    }

    const folderName = process.env.FOLDER_PATH || '/tmp/files_manager';
    const localPath = path.join(folderName, uuidv4());
    await fs.promises.mkdir(folderName, { recursive: true });
    await fs.promises.writeFile(path.join(folderName, uuidv4()), Buffer.from(data, 'base64'));

    const newFile = await dbClient.dbClient.collection('files').insertOne({ localPath, ...folderData });

    return res.status(201).json({ id: newFile.insertedId, localPath, ...folderData });
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;
    const file = await dbClient.dbClient.collection('files').findOne({ _id: ObjectId(fileId), userId });
    if (!file) return res.status(404).json({ error: 'Not found' });

    return res.json(file);
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parentId = req.query.parentId || '0';
    const query = { userId };
    if (parentId !== '0') {
      query.parentId = ObjectId(parentId);
    }

    const filesCount = await dbClient.dbClient.collection('files')
      .countDocuments({ userId, parentId: ObjectId(parentId) });

    if (filesCount === 0) {
      return res.json([]);
    }
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;
    // if (page > 0) {
    //   page -= 1; }

    const files = await dbClient.dbClient.collection('files')
      .aggregate([
        { $match: { userId, parentId: ObjectId(parentId) } },
        { $skip: skip },
        { $limit: pageSize },
      ]).toArray();

    return res.json(files);
  }
}

export default FilesController;
