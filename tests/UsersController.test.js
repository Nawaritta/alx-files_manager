import request from 'supertest';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';

chai.use(chaiHttp);
const expect = chai.expect;

describe('UsersController Endpoints', () => {
  it('POST /users responds with status 400 when email is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ password: 'testPassword' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Missing email');
  });

  it('POST /users responds with status 400 when password is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Missing password');
  });

  it('POST /users responds with status 400 when user already exists', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'testPassword' });
    expect(response).to.have.status(400);
    expect(response.body).to.have.property('error').to.equal('Already exist');
  });

});
