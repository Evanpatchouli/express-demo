import  axios from 'axios';
import { like } from "@pact-foundation/pact/src/v3/matchers";
const { Pact } = require('@pact-foundation/pact');
// import { PactV3, MatchersV3 } from '@pact-foundation/pact';
const { expect } = require('chai');
const path = require('path');

const provider = new Pact({
  consumer: '消费者',
  provider: '服务者',
  port: 8082,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'error',  //"trace" | "debug" | "info" | "warn" | "error" | undefined
});

describe('消费者测试', () => {
  before(() => provider.setup());
  afterEach(() => provider.verify());
  after(() => provider.finalize());

  describe('发起获取用户的请求', () => {
    before(() => {
      const interaction = {
        state: 'user exists',
        uponReceiving: 'a request to get user',
        withRequest: {
          method: 'GET',
          path: '/user',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: like({ name: 'John Doe', age: 30 }),
        },
      };
      return provider.addInteraction(interaction);
    });

    it('假设返回正确的响应', async () => {
      const response = await axios.get('http://localhost:8082/user');
      const json = await response.data;
      expect(json).to.deep.equal({ name: 'John Doe', age: 30 });
    });
  });
});
