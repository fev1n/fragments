// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  test('authenticated user deletes the fragment successfully', async () => {
    const post = await request(app)
      .post('/v1/fragments/')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Fragment created for GET unit test');

    const res = await request(app)
      .delete(`/v1/fragments/${post.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    const res2 = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.body.fragment).toBe(undefined);
  });

  test('Throws 404 error for invalid ID entered while deleting', async () => {
    const res = await request(app)
      .delete('/v1/fragments/idddd')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});
