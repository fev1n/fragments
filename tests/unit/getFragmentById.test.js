const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');

describe('GET /v1/fragment/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/1234id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users get a fragments data for given id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for GET unit test');

    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    logger.info(res.text);

    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('Fragment created for GET unit test');
  });

  test('should give error 404 if given id does not represent a known fragment', async () => {
    const res = await request(app).get('/v1/fragments/someID').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });

  test('should give error 415, if given fragment cannot get converted to extension given', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for GET unit test');

    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(415);
  });

  test('should convert data as per the extension provided within acceptable type', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send('# Fragment created for GET unit test');

    const res = await request(app)
      .get(`/v1/fragments/${post.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.headers['content-type']).toEqual('text/html');
  });

  test('successful conversion of markdown(.md) extension to html', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .send('# This is a markdown type fragment')
      .set('Content-type', 'text/markdown');

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('<h1>This is a markdown type fragment</h1>\n');
  });
});
