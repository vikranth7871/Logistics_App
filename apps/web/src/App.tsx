import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from '@store/auth.store';
import { wsService } from './services/websocket.service';

// ── Admin / General layouts & pages ─────────────────────────────────────────
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

// ── Driver Portal pages ──────────────────────────────────────────────────────
const DriverLayout = lazy(() => import('./components/layout/DriverLayout'));
const DriverDashboardPage = lazy(() => import('./pages/driver/DriverDashboardPage'));
const MyTripsPage = lazy(() => import('./pages/driver/MyTripsPage'));
const MyExpensesPage = lazy(() => import('./pages/driver/MyExpensesPage'));
const MyFuelPage = lazy(() => import('./pages/driver/MyFuelPage'));
const MyProfilePage = lazy(() => import('./pages/driver/MyProfilePage'));

// ── Auth guards ──────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Redirect drivers to their portal, keep all other roles in admin layout */
function RoleGate({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'driver') return <Navigate to="/driver/dashboard" replace />;
  return children;
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
        {/* ── Public ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Admin / General ERP (non-driver roles) ── */}
        <Route
          path="/"
          element={
            <RoleGate>
              <AppLayout />
            </RoleGate>
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

        {/* ── Driver Portal ── */}
        <Route
          path="/driver"
          element={
            <RequireAuth>
              <DriverLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/driver/dashboard" replace />} />
          <Route path="dashboard" element={<DriverDashboardPage />} />
          <Route path="trips" element={<MyTripsPage />} />
          <Route path="trips/:id" element={<TripDetailPage />} />
          <Route path="expenses" element={<MyExpensesPage />} />
          <Route path="fuel" element={<MyFuelPage />} />
          <Route path="profile" element={<MyProfilePage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
