const request = require('supertest');
const app = require('../../src/app');
const { readFragment } = require('../../src/model/data');
const logger = require('../../src/logger');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users is able to post a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('responses include all necessary and expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    const testFragment = await readFragment(res.body.fragment.ownerId, res.body.fragment.id);
    logger.debug('Response body for fragment' + res.body.fragment);

    expect(res.body.fragment).toEqual(testFragment);
    expect(res.body.fragment.id).not.toBeNull();
    expect(new Date(res.body.fragment.created)).toBeInstanceOf(Date);
    expect(new Date(res.body.fragment.updated)).toBeInstanceOf(Date);
    expect(res.body.fragment.type).toEqual('text/plain');
    expect(res.body.fragment.ownerId).not.toBeNull();
    expect(res.body.fragment.size).toEqual(35);
  });

  test('responses include a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    logger.debug(res.header.location);
    expect(res.header.location).toMatch(/\/v1\/fragments\/[a-zA-Z0-9-]+$/);
  });

  test('creating a fragment with unsupported type throws error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/exe')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    expect(res.statusCode).toEqual(415);
    expect(res.body.error.message).toBe('Unsupported Media Type');
  });

  test('resource not found with error code 404', async () => {
    const res = await request(app)
      .post('/v1/fragment')
      .set('Content-Type', 'application/exe')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for POST unit test');

    expect(res.statusCode).toEqual(404);
  });
});
