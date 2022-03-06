import {BindingKey} from '@loopback/context';
import {HodaTypes} from '.';
import {HodaDataSource} from '../datasources';
import {Hoda, Redis} from '../services';

export namespace HodaKey {
  export const SERVER_URL = BindingKey.create<string>('server_url');
  export const REDIS_SERVICE = BindingKey.create<Redis>('services.redis');
  export const HODA_SERVICE = BindingKey.create<Hoda>('services.Hoda');
  export const HODA_DATASOURCE =
    BindingKey.create<HodaDataSource>('datasources.HodaDS');
  export const HODA_DATA_SOURCE_CONFIG =
    BindingKey.create<HodaTypes.HodaDataSourceConfig>(
      'datasources.config.Hoda',
    );
}
