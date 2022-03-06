import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {HodaKey, HodaTypes} from '../helpers';

const config = {
  name: 'HodaDS',
  connector: 'rest',
  baseURL: process.env.HODA_BASE_URL,
  crud: false,
  headers: {
    accept: 'text/plain;charset=utf-8',
    'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
  },
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class HodaDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'HodaDS';
  static readonly defaultConfig = config;

  constructor(
    @inject(HodaKey.HODA_DATA_SOURCE_CONFIG, {optional: true})
    dsConfig: object = config,
  ) {
    dsConfig = Object.assign(dsConfig, {
      operations: operations(dsConfig as HodaTypes.HodaDataSourceConfig),
    });

    super(dsConfig);
  }
}

function operations(configData: HodaTypes.HodaDataSourceConfig) {
  return [
    {
      template: {
        method: 'POST',
        url: `${configData.HODA_BASE_URL}${configData.HODA_URL_START_AUTH}`,
        // json: true,
        form: {
          spRestId: '{spRestId:string}',
          spReqId: '{spReqId:string}',
          callBackUrl: `{callBackUrl:string}`,
          serviceId: '{serviceId:number}',
          hashedData: '{hashedData:string}',
        },
      },
      functions: {
        startAuth: [
          'spRestId',
          'spReqId',
          'callBackUrl',
          'serviceId',
          'hashedData',
        ],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${configData.HODA_BASE_URL}${configData.HODA_URL_GSB_GET_DATA}`,
        form: {
          authAssertion: '{authAssertion:string}',
          refId: '{refId:string}',
          hashedData: '{hashedData:string}',
        },
      },
      functions: {getData: ['authAssertion', 'refId', 'hashedData']},
    },
  ];
}
