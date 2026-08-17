import apiClient from '@api/client';

// ─────────────────────────────────────────────────────────────────
//  FLEET API — all /fleet/* endpoint calls
// ─────────────────────────────────────────────────────────────────

export interface VehicleListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateVehicleDto {
  registrationNumber: string;
  make?: string;
  model?: string;
  year?: number;
  capacityTons?: number;
  fuelType?: string;
  notes?: string;
}

export const fleetApi = {
  getVehicles: (params?: VehicleListParams) =>
    apiClient.get('/fleet/vehicles', { params }).then((r) => r.data.data),

  getVehicle: (id: string) =>
    apiClient.get(`/fleet/vehicles/${id}`).then((r) => r.data.data),

  createVehicle: (data: CreateVehicleDto) =>
    apiClient.post('/fleet/vehicles', data).then((r) => r.data.data),

  updateVehicle: (id: string, data: Partial<CreateVehicleDto>) =>
    apiClient.put(`/fleet/vehicles/${id}`, data).then((r) => r.data.data),

  deleteVehicle: (id: string) =>
    apiClient.delete(`/fleet/vehicles/${id}`).then((r) => r.data.data),

  getVehicleDocuments: (vehicleId: string) =>
    apiClient.get(`/fleet/vehicles/${vehicleId}/documents`).then((r) => r.data.data),

  uploadVehicleDocument: (
    vehicleId: string,
    file: File,
    metadata: { type: string; expiryDate?: string; notes?: string },
    onProgress?: (percent: number) => void,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([k, v]) => v && formData.append(k, v));
    return apiClient
      .post(`/fleet/vehicles/${vehicleId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data.data);
  },

  getExpiringDocuments: (days = 30) =>
    apiClient
      .get('/fleet/documents/expiring', { params: { days } })
      .then((r) => r.data.data),

  getFleetSummary: () =>
    apiClient.get('/fleet/summary').then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  TRIPS API
// ─────────────────────────────────────────────────────────────────

export interface TripListParams {
  page?: number;
  limit?: number;
  status?: string;
  vehicleId?: string;
  driverId?: string;
  customerId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export interface CreateTripDto {
  customerId?: string;
  vehicleId?: string;
  driverId?: string;
  origin: string;
  destination: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  freightAmount?: number;
  loadDescription?: string;
  loadWeightTons?: number;
  startOdometer?: number;
  endOdometer?: number;
  notes?: string;
}

export interface AssignTripDto {
  vehicleId: string;
  driverId: string;
}

export const tripApi = {
  getTrips: (params?: TripListParams) =>
    apiClient.get('/trips', { params }).then((r) => r.data.data),

  getTrip: (id: string) =>
    apiClient.get(`/trips/${id}`).then((r) => r.data.data),

  createTrip: (data: CreateTripDto) =>
    apiClient.post('/trips', data).then((r) => r.data.data),

  updateTrip: (id: string, data: Partial<CreateTripDto>) =>
    apiClient.put(`/trips/${id}`, data).then((r) => r.data.data),

  // Status transitions
  assignTrip: (id: string, data: AssignTripDto) =>
    apiClient.post(`/trips/${id}/assign`, data).then((r) => r.data.data),

  startTrip: (id: string, odometer?: number) =>
    apiClient.post(`/trips/${id}/start`, { odometer }).then((r) => r.data.data),

  confirmPickup: (id: string) =>
    apiClient.post(`/trips/${id}/pickup-confirm`).then((r) => r.data.data),

  deliverTrip: (id: string) =>
    apiClient.post(`/trips/${id}/deliver`).then((r) => r.data.data),

  completeTrip: (id: string, endOdometer?: number) =>
    apiClient
      .post(`/trips/${id}/complete`, { endOdometer })
      .then((r) => r.data.data),

  cancelTrip: (id: string, reason: string) =>
    apiClient
      .post(`/trips/${id}/cancel`, { reason })
      .then((r) => r.data.data),

  deleteTrip: (id: string) =>
    apiClient.delete(`/trips/${id}`).then((r) => r.data.data),

  uploadDeliveryProof: (id: string, file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'delivery_proof');
    return apiClient
      .post(`/trips/${id}/delivery-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total)
            onProgress(Math.round((e.loaded * 100) / e.total));
        },
      })
      .then((r) => r.data.data);
  },

  getActiveTrips: () =>
    apiClient.get('/trips/active').then((r) => r.data.data),

  getTripSummary: () =>
    apiClient.get('/trips/summary').then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  DRIVERS API
// ─────────────────────────────────────────────────────────────────

export const driverApi = {
  getDrivers: (params?: any) =>
    apiClient.get('/drivers', { params }).then((r) => r.data.data),

  getDriver: (id: string) =>
    apiClient.get(`/drivers/${id}`).then((r) => r.data.data),

  createDriver: (data: any) =>
    apiClient.post('/drivers', data).then((r) => r.data.data),

  updateDriver: (id: string, data: any) =>
    apiClient.put(`/drivers/${id}`, data).then((r) => r.data.data),

  deleteDriver: (id: string) =>
    apiClient.delete(`/drivers/${id}`).then((r) => r.data.data),

  getAvailableDrivers: () =>
    apiClient.get('/drivers/available').then((r) => r.data.data),

  assignVehicle: (driverId: string, vehicleId: string) =>
    apiClient
      .post(`/drivers/${driverId}/assign-vehicle`, { vehicleId })
      .then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  FUEL API
// ─────────────────────────────────────────────────────────────────

export const fuelApi = {
  getFuelEntries: (params?: any) =>
    apiClient.get('/fuel', { params }).then((r) => r.data.data),

  createFuelEntry: (data: any) =>
    apiClient.post('/fuel', data).then((r) => r.data.data),

  updateFuelEntry: (id: string, data: any) =>
    apiClient.put(`/fuel/${id}`, data).then((r) => r.data.data),

  deleteFuelEntry: (id: string) =>
    apiClient.delete(`/fuel/${id}`).then((r) => r.data.data),

  getAnalytics: (vehicleId?: string) =>
    apiClient
      .get(vehicleId ? `/fuel/analytics/vehicle/${vehicleId}` : '/fuel/analytics')
      .then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  EXPENSES API
// ─────────────────────────────────────────────────────────────────

export const expenseApi = {
  getExpenses: (params?: any) =>
    apiClient.get('/expenses', { params }).then((r) => r.data.data),

  createExpense: (data: any) =>
    apiClient.post('/expenses', data).then((r) => r.data.data),

  updateExpense: (id: string, data: any) =>
    apiClient.put(`/expenses/${id}`, data).then((r) => r.data.data),

  deleteExpense: (id: string) =>
    apiClient.delete(`/expenses/${id}`).then((r) => r.data.data),

  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post(`/expenses/${id}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },

  approveExpense: (id: string) =>
    apiClient.post(`/expenses/${id}/approve`).then((r) => r.data.data),

  getSummary: () =>
    apiClient.get('/expenses/summary').then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  MAINTENANCE API
// ─────────────────────────────────────────────────────────────────

export const maintenanceApi = {
  getMaintenanceRecords: (params?: any) =>
    apiClient.get('/maintenance', { params }).then((r) => r.data.data),

  getMaintenanceRecord: (id: string) =>
    apiClient.get(`/maintenance/${id}`).then((r) => r.data.data),

  createMaintenanceRecord: (data: any) =>
    apiClient.post('/maintenance', data).then((r) => r.data.data),

  updateMaintenanceRecord: (id: string, data: any) =>
    apiClient.put(`/maintenance/${id}`, data).then((r) => r.data.data),

  deleteMaintenanceRecord: (id: string) =>
    apiClient.delete(`/maintenance/${id}`).then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  CUSTOMERS API
// ─────────────────────────────────────────────────────────────────

export const customerApi = {
  getCustomers: (params?: any) =>
    apiClient.get('/customers', { params }).then((r) => r.data.data),

  getCustomer: (id: string) =>
    apiClient.get(`/customers/${id}`).then((r) => r.data.data),

  createCustomer: (data: any) =>
    apiClient.post('/customers', data).then((r) => r.data.data),

  updateCustomer: (id: string, data: any) =>
    apiClient.put(`/customers/${id}`, data).then((r) => r.data.data),

  getBalance: (id: string) =>
    apiClient.get(`/customers/${id}/balance`).then((r) => r.data.data),

  getStatement: (id: string, from: string, to: string) =>
    apiClient
      .get(`/customers/${id}/statement`, { params: { from, to } })
      .then((r) => r.data.data),

  deleteCustomer: (id: string) =>
    apiClient.delete(`/customers/${id}`).then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  BILLING API
// ─────────────────────────────────────────────────────────────────

export const billingApi = {
  getInvoices: (params?: any) =>
    apiClient.get('/invoices', { params }).then((r) => r.data.data),

  getInvoice: (id: string) =>
    apiClient.get(`/invoices/${id}`).then((r) => r.data.data),

  createInvoice: (data: any) =>
    apiClient.post('/invoices', data).then((r) => r.data.data),

  finalizeInvoice: (id: string) =>
    apiClient.post(`/invoices/${id}/finalize`).then((r) => r.data.data),

  downloadPdf: (id: string) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),

  getOutstandingInvoices: () =>
    apiClient.get('/invoices/outstanding').then((r) => r.data.data),

  recordPayment: (data: any) =>
    apiClient.post('/payments', data).then((r) => r.data.data),
};

// ─────────────────────────────────────────────────────────────────
//  REPORTS API
// ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  getDashboard: (period?: string) =>
    apiClient
      .get('/reports/dashboard', { params: { period } })
      .then((r) => r.data.data),

  getRevenue: (params?: any) =>
    apiClient.get('/reports/revenue', { params }).then((r) => r.data.data),

  getExpenses: (params?: any) =>
    apiClient.get('/reports/expenses', { params }).then((r) => r.data.data),

  getProfitability: (params?: any) =>
    apiClient
      .get('/reports/profitability', { params })
      .then((r) => r.data.data),

  getExpenseBreakdown: () =>
    apiClient.get('/reports/expenses-breakdown').then((r) => r.data.data),

  exportReport: (reportType: string, params?: any) =>
    apiClient
      .get('/reports/export', {
        params: { type: reportType, ...params },
        responseType: 'blob',
      })
      .then((r) => r.data),
};
