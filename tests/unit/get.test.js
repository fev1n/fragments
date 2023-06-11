// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated user gets full metadata of fragments stored for current user (when query param: expand=1)', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');

    logger.debug(res.body.fragments[0].id);
    logger.debug(post.body.fragment);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments[0].id).toBe(post.body.fragment.id);
    expect(res.body.fragments[0].ownerId).toBe(post.body.fragment.ownerId);
    expect(res.body.fragments[0].type).toEqual(post.body.fragment.type);
    expect(new Date(res.body.fragments[0].created)).toBeInstanceOf(Date);
    expect(new Date(res.body.fragments[0].updated)).toBeInstanceOf(Date);
    expect(res.body.fragments[0].size).toEqual(post.body.fragment.size);
  });

  test('should give error 404 if GET /v1/fragments is not same', async () => {
    const res = await request(app).get('/v1/fragmentsS').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});
