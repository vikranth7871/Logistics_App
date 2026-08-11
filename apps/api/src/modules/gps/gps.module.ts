import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { NoneAdapter } from './adapters/none.adapter';
import { TraccarAdapter } from './adapters/traccar.adapter';

const GPS_ADAPTER = 'GPS_ADAPTER';

@Module({
  imports: [ConfigModule],
  controllers: [GpsController],
  providers: [
    {
      provide: GPS_ADAPTER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('GPS_PROVIDER', 'none');
        switch (provider) {
          case 'traccar':
            return new TraccarAdapter(config);
          // case 'wialon': return new WialonAdapter(config);
          default:
            return new NoneAdapter();
        }
      },
    },
    GpsService,
  ],
  exports: [GpsService],
})
export class GpsModule {}
