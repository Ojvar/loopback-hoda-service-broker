import {ContextTags, injectable} from '@loopback/core';
import debugFactory from 'debug';
import {createClient, RedisClientOptions, RedisClientType} from 'redis';

const trace = debugFactory('Hoda::RedisHelper');

@injectable({
  tags: {[ContextTags.NAME]: 'redis', [ContextTags.NAMESPACE]: 'helpers'},
})
export class RedisHelper {
  private _client: RedisClientType;

  get client(): RedisClientType {
    return this._client;
  }

  constructor(configs: RedisConfig) {
    this._client = createClient({
      socket: {
        port: configs.port,
        host: configs.host,
      },
      password: configs.password,
      database: configs.db,
    } as RedisClientOptions);

    this._client
      .connect()
      .then(() => trace('Connecting to redis successfully'))
      .catch(err => {
        console.error(err);
        trace('Connecting to redis failed');
      });
  }

  async disconnect() {
    // return this._client.disconnect();
    return this._client.quit();
  }
}

export type RedisConfig = {
  host: string;
  port: number;
  password: string;
  db: number;
};
