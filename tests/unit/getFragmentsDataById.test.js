const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');
const hash = require('../../src/hash');
const { readFragment } = require('../../src/model/data');

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/:id/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/:id/info')
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
      .get(`/v1/fragments/${post1.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    logger.info(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).not.toBe(post2.body);
  });

  test('should give error 404 if given id does not represent a known fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/someID/info')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('gets fragment data by ID while searched with specific ID', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for GET unit test')
      .set('Content-type', 'text/plain');

    const fragment = await readFragment(hash('user1@email.com'), req.body.fragment.id);

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    console.log(res.body.fragmentData.id);
    console.log(fragment);

    expect(res.body.fragmentData.id).toEqual(req.body.fragment.id);
    expect(res.body.fragmentData).toEqual(req.body.fragment);
  });

  test('gets appropriate content type for specific fragment while using GET with particular id', async () => {
    const req = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1');

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(res.type).toEqual('application/json');
  });
});
