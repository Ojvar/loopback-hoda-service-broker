import {
  BindingScope,
  config,
  ContextTags,
  injectable,
  Provider,
} from '@loopback/core';
import {RedisConfig, RedisHelper} from '../helpers';

export type Redis = RedisHelper;

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.NAME]: 'redis', [ContextTags.NAMESPACE]: 'services'},
})
export class RedisProvider implements Provider<Redis> {
  constructor(
    @config()
    private configs: RedisConfig,
  ) {}

  async value(): Promise<Redis> {
    return new RedisHelper(this.configs);
  }
}
