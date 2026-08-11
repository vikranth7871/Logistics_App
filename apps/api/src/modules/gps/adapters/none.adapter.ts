import { Injectable, Logger } from '@nestjs/common';
import { GpsAdapter, GpsLocation } from './gps-adapter.interface';

/**
 * No-op GPS adapter — used when GPS_PROVIDER=none (Phase 1).
 * Returns empty data so the rest of the system works without GPS.
 */
@Injectable()
export class NoneAdapter implements GpsAdapter {
  private readonly logger = new Logger(NoneAdapter.name);

  async getVehicleLocation(_deviceId: string): Promise<GpsLocation | null> {
    this.logger.debug('GPS not configured. Returning null.');
    return null;
  }

  async getAllVehicleLocations(): Promise<GpsLocation[]> {
    return [];
  }

  async getVehicleHistory(
    _deviceId: string,
    _from: Date,
    _to: Date,
  ): Promise<GpsLocation[]> {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
