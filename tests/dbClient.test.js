import { expect } from 'chai';
import dbClient from '../utils/db';

before(async () => {
  await dbClient.dbClient.collection('users').deleteMany({});
});
after(async () => {
  await dbClient.dbClient.collection('users').deleteMany({});
});

describe('dbClient', () => {
  it('should connect to MongoDB', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should get the number of users', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).to.equal(0);
  });

  it('should add a file to the database', async () => {
    await dbClient.dbClient.collection('files').deleteMany({});

    await dbClient.dbClient.collection('files').insertOne({ name: 'testFile', type: 'file', data: 'testData' });
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).to.equal(1);
  });

});
