/**
 * GPS Adapter Interface — provider-agnostic contract.
 * All GPS providers MUST implement this interface.
 * Switch providers by changing GPS_PROVIDER env variable — zero code changes.
 */
export interface GpsLocation {
  vehicleId: string;         // Internal vehicle ID
  deviceId: string;          // GPS device/unit ID from provider
  latitude: number;
  longitude: number;
  speed: number;             // km/h
  heading: number;           // degrees 0-360
  ignitionOn: boolean;
  odometer: number;          // km, from GPS device
  timestamp: Date;
  address?: string;          // reverse geocoded address (optional)
}

export interface GpsAdapter {
  /**
   * Get latest location for a single vehicle.
   */
  getVehicleLocation(deviceId: string): Promise<GpsLocation | null>;

  /**
   * Get latest locations for all vehicles in the fleet.
   */
  getAllVehicleLocations(): Promise<GpsLocation[]>;

  /**
   * Get location history for a vehicle within a time range.
   */
  getVehicleHistory(
    deviceId: string,
    from: Date,
    to: Date,
  ): Promise<GpsLocation[]>;

  /**
   * Check if the GPS provider is reachable.
   */
  healthCheck(): Promise<boolean>;
}
