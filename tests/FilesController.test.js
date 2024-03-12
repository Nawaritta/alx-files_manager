import { expect } from 'chai';
import request from 'supertest';
import app from '../server';

describe('FilesController Endpoints', () => {

  before(async () => {
    await dbClient.dbClient.collection('users').deleteMany({});
    await dbClient.dbClient.collection('files').deleteMany({});
  });

  it('POST /files responds with status 401 when token is missing', async () => {
    const response = await request(app)
      .post('/files')
      .send({ name: 'testFile', type: 'file', data: 'testData' });
    expect(response).to.have.status(401);
  });

  it('GET /files/:id responds with status 401 when token is missing', async () => {
    const response = await request(app)
      .get('/files/123');
    expect(response).to.have.status(401);
  });

  it('GET /files responds with status 401 when token is missing', async () => {
    const response = await request(app)
      .get('/files');
    expect(response).to.have.status(401);
  });

  it('PUT /files/:id/publish responds with status 401 when token is missing', async () => {
    const response = await request(app)
      .put('/files/123/publish');
    expect(response).to.have.status(401);
  });

  it('PUT /files/:id/unpublish responds with status 401 when token is missing', async () => {
    const response = await request(app)
      .put('/files/123/unpublish');
    expect(response).to.have.status(401);
  });

  it('GET /files/:id/data responds with status 401 when token is missing', async () => {
    const response = await request(app)
      .get('/files/123/data');
    expect(response).to.have.status(401);
  });

  it('adds a single file and retrieves it', async () => {
    await dbClient.dbClient.collection('files').deleteMany({});
    const response = await request(app)
      .post('/files')
      .send({ name: 'testFile', type: 'file', data: 'testData' });

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('id');
    expect(response.body).to.have.property('name').to.equal('testFile');

    const fileId = response.body.id;
    const getFileResponse = await request(app).get(`/files/${fileId}`);
    expect(getFileResponse).to.have.status(200);
    expect(getFileResponse.body).to.have.property('name').to.equal('testFile');

  });



});
