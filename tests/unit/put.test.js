const request = require('supertest');
const app = require('../../src/app');
const { readFragmentData } = require('../../src/model/data');
const hash = require('../../src/hash');

describe('PUT /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('incorrect ID are denied', async () => {
    const res = await request(app)
      .put('/v1/fragments/idddd')
      .set('Content-type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for PUT unit test');

    expect(res.status).toBe(404);
  });

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users is able to update a fragment details', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for PUT unit test');

    const put = await request(app)
      .put(`/v1/fragments/${res.body.fragment.id}`)
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send("updated fragment's data");

    expect(put.statusCode).toBe(200);

    const data = await readFragmentData(hash('user1@email.com'), put.body.fragment.id);

    const req = await request(app)
      .get(`/v1/fragments/${put.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .responseType('blob');

    expect(req.body.toString()).toBe(data.toString());
  });

  test('authenticated user is unable to update fragment data', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for PUT unit test');

    const put = await request(app)
      .put(`/v1/fragments/${res.body.fragment.id}`)
      .set('Content-type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send("updated fragment's data");

    expect(put.status).toBe(400);

    const req = await request(app)
      .get(`/v1/fragments/${res.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .responseType('blob');

    expect(req.body.toString()).toBe('Fragment created for PUT unit test');
  });
});
