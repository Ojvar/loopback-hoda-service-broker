import {model, property} from '@loopback/repository';

export namespace HodaTypes {
  export class HodaDataSourceConfig {
    HODA_BASE_URL: string;
    HODA_WS_PASSWORD: string;
    HODA_SP_REST_ID: string;
    HODA_SERVICE_ID: number;
    HODA_URL_START_AUTH: string;
    HODA_URL_AUTH_GATEWAY: string;
    HODA_URL_GSB_GET_DATA: string;

    [key: string]: string | number | boolean;
  }

  export enum Status {
    OK = 'OK',
    UNAUTHORIZED = 'UNAUTHORIZED',
    VALIDATION_EXCEPTION = 'VALIDATION_EXCEPTION',
    WRONG_CREDENTIALS = 'WRONG_CREDENTIALS',
    ACCESS_DENIED = 'ACCESS_DENIED',
    EXCEPTION = 'EXCEPTION',
    NOT_FOUND = 'NOT_FOUND',
    DISACTIVE = 'DISACTIVE',
    USED = 'USED',
    REPEATLY = 'REPEATLY',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    INVALID_VALUE = 'INVALID_VALUE',
    EXPIRE = 'EXPIRE',
  }

  @model()
  export class StartAuthInput {
    @property({
      type: 'string',
      pattern:
        'https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)',
    })
    callBackUrl: string;

    spReqId: string;
    spRestId: string;
    serviceId: number;
    hashedData: string;
  }

  @model()
  export class StartAuthResult {
    @property({
      type: 'string',
      jsonSchema: {type: 'string', enum: Object.values(Status)},
    })
    status: Status;
    @property() errors?: string;
    @property({
      jsonSchema: {
        type: 'object',
        properties: {
          refId: {type: 'string'},
          spReqId: {type: 'string'},
        },
      },
    })
    payload?: {
      refId: string;
      spReqId: string;
    };
    @property({type: 'string', jsonSchema: {type: 'string'}})
    redirectUrl: string;
  }

  @model({jsonSchema: {required: ['status']}})
  export class AuthCallbackRequest {
    @property({
      type: 'string',
      jsonSchema: {type: 'string', enum: Object.values(Status)},
    })
    status: Status;
    @property({type: 'string', jsonSchema: {type: 'string'}})
    errors?: string;
    @property({type: 'string'})
    payload?: string;
  }

  @model()
  export class GetDataResult {
    @property({
      type: 'string',
      jsonSchema: {type: 'string', enum: Object.values(Status)},
    })
    status: Status;
    @property() errors?: string;
    @property({
      jsonSchema: {
        type: 'object',
        properties: {
          identityAssertion: {type: 'string'},
          name: {type: 'string'},
          family: {type: 'string'},
          nin: {type: 'number'},
          fatherName: {type: 'string'},
          alive: {type: 'number'},
          city: {type: 'string'},
          birthdate: {type: 'number'},
          gender: {type: 'number'},
        },
      },
    })
    payload?: {
      identityAssertion: string;
      name: string;
      family: string;
      nin: number;
      fatherName: string;
      alive: number;
      city: string;
      birthdate: number;
      gender: number;
      mobile: string;

      /* Etc */
      [key: string]: string | number;
    };
  }
}
