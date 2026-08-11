import { Injectable, Inject } from '@nestjs/common';
import { GpsAdapter } from './adapters/gps-adapter.interface';

@Injectable()
export class GpsService {
  constructor(@Inject('GPS_ADAPTER') private adapter: GpsAdapter) {}

  getVehicleLocation(deviceId: string) {
    return this.adapter.getVehicleLocation(deviceId);
  }

  getAllVehicleLocations() {
    return this.adapter.getAllVehicleLocations();
  }

  getVehicleHistory(deviceId: string, from: Date, to: Date) {
    return this.adapter.getVehicleHistory(deviceId, from, to);
  }

  healthCheck() {
    return this.adapter.healthCheck();
  }
}
