import {inject} from '@loopback/core';
import {
  HttpErrors,
  post,
  requestBody,
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import debugFactory from 'debug';
import QueryString from 'qs';
import SHA3 from 'sha3';
import {v4 as uuidV4} from 'uuid';
import {HodaKey, HodaTypes} from '../helpers';
import {Hoda, Redis} from '../services';

const trace = debugFactory('Hoda:Hoda-controller');

const StartAuthResponseBody: object = {
  description: 'StartAuth response body structure',
  content: {
    'application/json': {schema: {'x-ts-type': HodaTypes.StartAuthResult}},
  },
};
const StartAuthRequestBody: object = {
  description: 'Start-Auth request body structure',
  content: {
    'application/json': {schema: {'x-ts-type': HodaTypes.StartAuthInput}},
  },
};
const AuthCallbackRequestBody: object = {
  description: 'Auth callback request body structure',
  content: {
    'application/x-www-form-urlencoded': {
      schema: {'x-ts-type': HodaTypes.AuthCallbackRequest},
    },
  },
};
const GetDataResponseBody: object = {
  description: 'Callback response body structure',
  content: {
    'application/json': {schema: {'x-ts-type': HodaTypes.GetDataResult}},
  },
};

export class HodaController {
  constructor(
    @inject(HodaKey.HODA_SERVICE)
    private hodaService: Hoda,
    @inject(HodaKey.HODA_DATA_SOURCE_CONFIG)
    private hodaConfig: HodaTypes.HodaDataSourceConfig,
    @inject(HodaKey.REDIS_SERVICE)
    private redisService: Redis,
  ) {}

  @post('/start-auth')
  @response(200, StartAuthResponseBody)
  async startAuth(
    @requestBody(StartAuthRequestBody)
    body: HodaTypes.StartAuthInput,
    @inject(HodaKey.SERVER_URL)
    serverUrl: string,
  ): Promise<HodaTypes.StartAuthResult> {
    /* Fix callbackUrl to matched by the convention */
    const clientCallbackUrl = body.callBackUrl;

    body.callBackUrl = `${serverUrl}/callback`.replace('://', '_//');
    body.spReqId = uuidV4();
    body.spRestId = this.hodaConfig.HODA_SP_REST_ID;
    body.serviceId = this.hodaConfig.HODA_SERVICE_ID;
    body.hashedData = new SHA3(512)
      .update(this.hodaConfig.HODA_WS_PASSWORD + body.spReqId)
      .digest('hex');

    trace('START-AUTH REQUEST', JSON.stringify(body, null, 2));

    /* Send authentication request */
    const authResult = await this.hodaService.startAuth(
      body.spRestId,
      body.spReqId,
      body.callBackUrl,
      body.serviceId,
      body.hashedData,
    );

    /* Error occured */
    if (authResult.status !== HodaTypes.Status.OK) {
      trace('START-AUTH REQUEST [ERROR]', authResult);
      return authResult;
    }

    /* Try to generate link */
    const hashedData = new SHA3(512)
      .update(
        this.hodaConfig.HODA_WS_PASSWORD +
          String(authResult.payload?.spReqId) +
          String(authResult.payload?.refId),
      )
      .digest('hex');
    const qStr = QueryString.stringify({
      hashedData,
      refId: String(authResult.payload?.refId),
    });
    authResult.redirectUrl = `${this.hodaConfig.HODA_BASE_URL}${this.hodaConfig.HODA_URL_AUTH_GATEWAY}?${qStr}`;

    /* Save data to redis-database */
    await this.saveRequestData({
      requestId: body.spReqId,
      callbackUrl: clientCallbackUrl,
    } as SaveRequestData);

    trace('START-AUTH REQUEST [RESULT]', authResult);

    return authResult;
  }

  @post('/callback')
  @response(200, GetDataResponseBody)
  async callback(
    @requestBody(AuthCallbackRequestBody)
    body: HodaTypes.AuthCallbackRequest,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {
    trace('Callback', body);

    /* Check result */
    if (body.status !== HodaTypes.Status.OK) {
      throw new HttpErrors.UnprocessableEntity('Invalid Request');
    }

    const payload: CallbackResponsePayload = JSON.parse(body.payload ?? '{}');
    if (!payload) {
      throw new HttpErrors.BadRequest();
    }

    /* Call get-data api */
    const hashedData = new SHA3(512)
      .update(
        this.hodaConfig.HODA_WS_PASSWORD +
          String(payload.refId) +
          String(payload.spReqId),
      )
      .digest('hex');
    const result = await this.hodaService.getData(
      String(payload.authAssertion),
      String(payload.refId),
      hashedData,
    );
    trace('Callback [RESULT]', result);

    /* Check status */
    if (result.status !== 'OK') {
      /* Status maybe is everything else 'OK" like as : EXPIRE, ... */
      throw new HttpErrors.BadRequest();
    }

    /* Redirect to user's callback url */
    let callbackUrl: string | null = await this.retrieveCallbackUrl(
      String(payload.spReqId),
    );
    trace('User callback url', callbackUrl);

    if (!callbackUrl) {
      throw new HttpErrors.InternalServerError();
    }

    /* Prepare callback url */
    const callbackData = {
      name: result.payload?.name,
      family: result.payload?.family,
      nin: result.payload?.nin,
      birthDate: result.payload?.birthDate,
      mobile: result.payload?.mobile,
    };
    callbackUrl = encodeURIComponent(
      `${callbackUrl}?${QueryString.stringify(callbackData)}`,
    );
    res.redirect(callbackUrl);
  }

  async saveRequestData(data: SaveRequestData) {
    await this.redisService.client.set(data.requestId, data.callbackUrl);
    trace('Redis data set %s:%s', data.requestId, data.callbackUrl);
  }

  async retrieveCallbackUrl(requestId: string): Promise<string | null> {
    return this.redisService.client.get(requestId);
  }
}

export type SaveRequestData = {
  requestId: string;
  callbackUrl: string;
};

export type CallbackResponsePayload = {
  authAssertion: string;
  refId: string;
  spReqId: string;
};
