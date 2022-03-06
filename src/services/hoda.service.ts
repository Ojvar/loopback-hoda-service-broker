import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {HodaDataSource} from '../datasources';
import {HodaKey, HodaTypes} from '../helpers';

export interface Hoda {
  startAuth(
    spRestId: string,
    spReqId: string,
    callBackUrl: string,
    serviceId: number,
    hashedData: string,
  ): Promise<HodaTypes.StartAuthResult>;
  getData(
    authAssertion: string,
    refId: string,
    hashedData: string,
  ): Promise<HodaTypes.GetDataResult>;
}

export class HodaProvider implements Provider<Hoda> {
  constructor(
    // HodaDS must match the name property in the datasource json file
    @inject(HodaKey.HODA_DATASOURCE)
    protected dataSource: HodaDataSource = new HodaDataSource(),
  ) {}

  value(): Promise<Hoda> {
    return getService(this.dataSource);
  }
}
