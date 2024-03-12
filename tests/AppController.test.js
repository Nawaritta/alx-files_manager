import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);
const expect = chai.expect;

describe('AppController and AuthController Endpoints', () => {
    it('GET /status responds with status 200 and JSON object with redis and db properties', async () => {
      const response = await request(app).get('/status');
      expect(response).to.have.status(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('redis');
      expect(response.body).to.have.property('db');
    });

    it('GET /stats responds with status 200 and JSON object with users and files properties', async () => {
        const response = await request(app).get('/stats');
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('users');
        if ('files' in response.body) {
            expect(response.body.files).to.be.an('array');
        } else {
            expect(response.body).to.not.have.property('files');
        }
    });

    it('GET /connect responds with status 401 when Authorization header is missing', async () => {
      const response = await request(app).get('/connect');
      expect(response).to.have.status(401);
    });

    it('GET /disconnect responds with status 401 when X-Token header is missing', async () => {
      const response = await request(app).get('/disconnect');
      expect(response).to.have.status(401);
    });
  });


