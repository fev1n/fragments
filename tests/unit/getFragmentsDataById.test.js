const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/:id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/:id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users get a fragments data for given id', async () => {
    const post1 = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    const post2 = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test 2');

    const res = await request(app)
      .get(`/v1/fragments/${post1.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    logger.info(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).not.toBe(post2.body);
  });

  test('should give error 404 if given id does not represent a known fragment', async () => {
    const res = await request(app).get('/v1/fragments/someID').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});
