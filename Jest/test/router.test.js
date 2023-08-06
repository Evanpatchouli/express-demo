const request = require('supertest');
const app = require('../src/app');

describe('router test', () => {
  it('GET /', () => {
    request(app).get('/')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(res => {
      expect(res.body).toStrictEqual({
        ok: true, 
        msg: 'Hello World!', 
        data: null, 
        symbol: 1, 
        type: 'Ok' 
      });
    }).catch(err => console.error(err));
  })
})