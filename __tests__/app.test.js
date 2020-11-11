require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns just Jon\'s todos', async () => {

      const expectation = [
        {
          id: 4,
          owner_id: 2,
          todo: 'wash the dishes',
          completed: false
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns Jon\'s updated todo', async () => {

      const expectation = [
        {
          id: 4,
          owner_id: 2,
          todo: 'wash the dishes',
          completed: true
        }
      ];

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns Jon\'s new todo list', async () => {

      const expectation = [
        {
          id: 4,
          owner_id: 2,
          todo: 'wash the dishes',
          completed: true
        },
        {
          id: 5,
          owner_id: 2,
          todo: 'mow the yard',
          completed: false
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[1])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


  });
});


