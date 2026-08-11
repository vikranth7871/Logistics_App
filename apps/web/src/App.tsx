import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '@store/auth.store';
import { wsService } from './services/websocket.service';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const FleetPage = lazy(() => import('./pages/fleet/FleetPage'));
const VehicleDetailPage = lazy(() => import('./pages/fleet/VehicleDetailPage'));
const DriversPage = lazy(() => import('./pages/drivers/DriversPage'));
const TripsPage = lazy(() => import('./pages/trips/TripsPage'));
const TripDetailPage = lazy(() => import('./pages/trips/TripDetailPage'));
const FuelPage = lazy(() => import('./pages/fuel/FuelPage'));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'));
const MaintenancePage = lazy(() => import('./pages/maintenance/MaintenancePage'));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'));
const BillingPage = lazy(() => import('./pages/billing/BillingPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));
const AuditPage = lazy(() => import('./pages/audit/AuditPage'));

function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      wsService.connect();
    } else {
      wsService.disconnect();
    }
    return () => wsService.disconnect();
  }, [isAuthenticated, accessToken]);

  return (
    <Suspense fallback={<div className="app-loading">Loading…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="fleet/:id" element={<VehicleDetailPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="trips/:id" element={<TripDetailPage />} />
          <Route path="fuel" element={<FuelPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
