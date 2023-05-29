// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('404 handler for app', () => {
  test('send 404-error for undefined route request', () =>
    request(app).get('/404error-check-route').expect(404));
});
