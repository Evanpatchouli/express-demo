"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const matchers_1 = require("@pact-foundation/pact/src/v3/matchers");
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
    logLevel: 'error', //"trace" | "debug" | "info" | "warn" | "error" | undefined
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
                    body: (0, matchers_1.like)({ name: 'John Doe', age: 30 }),
                },
            };
            return provider.addInteraction(interaction);
        });
        it('应该返回正确的响应', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get('http://localhost:8082/user');
            const json = yield response.data;
            expect(json).to.deep.equal({ name: 'John Doe', age: 30 });
        }));
    });
});
