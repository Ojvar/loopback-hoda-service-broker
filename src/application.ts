import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {HodaKey, RedisConfig} from './helpers';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class HodaServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({path: '/explorer'});
    this.component(RestExplorerComponent);

    /* Config app */
    this.configApplication(options);
    /* Setup hooks */
    this.onStart(() => {
      this.bind(HodaKey.SERVER_URL).to(String(this.restServer.url));
    });

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  configApplication(options: ApplicationConfig) {
    this.configure(HodaKey.REDIS_SERVICE).to({
      db: +(process.env.REDIS_DB ?? '0'),
      host: process.env.REDIS_HOST ?? 'localhost',
      password: process.env.REDIS_PASSWORD,
      port: +(process.env.REDIS_PORT ?? '6379'),
    } as RedisConfig);

    this.bind(HodaKey.HODA_DATA_SOURCE_CONFIG).to({
      name: 'HodaDS',
      connector: 'rest',
      baseURL: process.env.HODA_BASE_URL,
      crud: false,

      HODA_BASE_URL: process.env.HODA_BASE_URL,
      HODA_WS_PASSWORD: process.env.HODA_WS_PASSWORD,
      HODA_SP_REST_ID: process.env.HODA_SP_REST_ID,
      HODA_SERVICE_ID: +process.env.HODA_SERVICE_ID,
      HODA_URL_START_AUTH: process.env.HODA_URL_START_AUTH,
      HODA_URL_AUTH_GATEWAY: process.env.HODA_URL_AUTH_GATEWAY,
      HODA_URL_GSB_GET_DATA: process.env.HODA_URL_GSB_GET_DATA,
    });
  }
}
