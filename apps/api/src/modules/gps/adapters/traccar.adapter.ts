import { Injectable, Logger, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GpsAdapter, GpsLocation } from './gps-adapter.interface';

/**
 * Traccar GPS adapter.
 * Traccar is open-source and can be self-hosted.
 * Docs: https://www.traccar.org/api-reference/
 *
 * Required env vars:
 *   TRACCAR_URL=https://your-traccar-server.com
 *   TRACCAR_TOKEN=your_api_token
 */
@Injectable()
export class TraccarAdapter implements GpsAdapter {
  private readonly logger = new Logger(TraccarAdapter.name);
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(private config: ConfigService) {
    this.baseUrl = config.get<string>('TRACCAR_URL', '');
    this.headers = {
      Authorization: `Bearer ${config.get<string>('TRACCAR_TOKEN', '')}`,
      'Content-Type': 'application/json',
    };
  }

  async getVehicleLocation(deviceId: string): Promise<GpsLocation | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/positions`, {
        headers: this.headers,
        params: { deviceId },
      });
      const pos = res.data?.[0];
      if (!pos) return null;
      return this.mapToGpsLocation(pos, deviceId);
    } catch (err) {
      this.logger.error(`Traccar getVehicleLocation failed: ${err.message}`);
      return null;
    }
  }

  async getAllVehicleLocations(): Promise<GpsLocation[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/positions`, {
        headers: this.headers,
      });
      return (res.data || []).map((pos: any) =>
        this.mapToGpsLocation(pos, pos.deviceId?.toString()),
      );
    } catch (err) {
      this.logger.error(`Traccar getAllVehicleLocations failed: ${err.message}`);
      return [];
    }
  }

  async getVehicleHistory(
    deviceId: string,
    from: Date,
    to: Date,
  ): Promise<GpsLocation[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/reports/route`, {
        headers: this.headers,
        params: {
          deviceId,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      return (res.data || []).map((pos: any) =>
        this.mapToGpsLocation(pos, deviceId),
      );
    } catch (err) {
      this.logger.error(`Traccar getVehicleHistory failed: ${err.message}`);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/server`, { headers: this.headers });
      return true;
    } catch {
      return false;
    }
  }

  private mapToGpsLocation(pos: any, deviceId: string): GpsLocation {
    return {
      vehicleId: deviceId,
      deviceId,
      latitude: pos.latitude,
      longitude: pos.longitude,
      speed: pos.speed || 0,
      heading: pos.course || 0,
      ignitionOn: pos.attributes?.ignition ?? false,
      odometer: pos.attributes?.totalDistance || 0,
      timestamp: new Date(pos.fixTime || pos.serverTime),
    };
  }
}
