// Do not delete this file
import request from 'sync-request-curl';
import config from '../../src/config.json';
const SERVER_URL = `${config.url}:${config.port}`;

const port = config.port;
const url = config.url;

describe('HTTP tests using Jest', () => {
  test('Test successful echo', () => {
    const res = request(
      'GET',
      `${url}:${port}/echo`,
      {
        qs: {
          echo: 'Hello',
        },
        // adding a timeout will help you spot when your server hangs
        timeout: 100
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(bodyObj.value).toEqual('Hello');
  });

  test('Test invalid echo', () => {
    const res = request(
      'GET',
      `${url}:${port}/echo`,
      {
        qs: {
          echo: 'echo',
        },
        timeout: 100
      }
    );
    expect(res.statusCode).toStrictEqual(400);
  });
});

test('unknow route', () => {
  const res = request('POST', SERVER_URL + '/notaroute');
  expect(res.statusCode).toBe(404);
});
