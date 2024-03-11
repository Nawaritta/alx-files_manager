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
        userId, name, type, isPublic: isPublic || false, parentId: parentId || '0',
      });
      return res.status(201).json({ id: newFolder.insertedId, ...folderData });
    }

    const folderName = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileId = uuidv4();
    const localPath = path.join(folderName, fileId);
    await fs.promises.mkdir(folderName, { recursive: true });
    await fs.promises.writeFile(path.join(folderName, fileId), Buffer.from(data, 'base64'));

    const newFile = await dbClient.dbClient.collection('files').insertOne({ localPath, ...folderData });

    return res.status(201).json({ id: newFile.insertedId, localPath, ...folderData });
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    // catch fileId validation
    const fileId = req.params.id;
    const file = await dbClient.dbClient.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

    if (!file) return res.status(404).json({ error: 'Not found' });
    // delete file.localPath;
    return res.json(file);
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let parentId = req.query.parentId || '0';

    // const query = { userId };
    if (parentId !== '0') {
      parentId = ObjectId(parentId);
    }

    console.log(userId, parentId);
    const filesCount = await dbClient.dbClient.collection('files')
      .countDocuments({ userId: ObjectId(userId), parentId });
    if (filesCount === '0') {
      console.log('return empty list');
      return res.json([]);
    }

    const page = parseInt(req.query.page, 10) || '0';
    const pageSize = 20;
    // if (page > 0) {
    //   page -= 1; }

    const skip = page * pageSize;
    const files = await dbClient.dbClient.collection('files')
      .aggregate([
        { $match: { userId: ObjectId(userId), parentId } },
        { $skip: skip },
        { $limit: pageSize },
      ]).toArray();
    // maybe a lala nora, remove localpath
    console.log(files);
    const modifyResult = files.map((file) => ({
      ...file,
      id: file._id, // rename _id to id
      _id: undefined, // remove _id
    }));
    return res.json(modifyResult);
  }
}

export default FilesController;
