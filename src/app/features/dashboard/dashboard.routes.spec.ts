import { DASHBOARD_ROUTES } from './dashboard.routes';
import { DashboardComponent } from './components/dashboard/dashboard';

describe('DASHBOARD_ROUTES', () => {
  it('should have a root route for DashboardComponent', () => {
    const root = DASHBOARD_ROUTES.find((r) => r.path === '');
    expect(root).toBeDefined();
    expect(root?.component).toBe(DashboardComponent);
  });

  it('should set title to Dashboard', () => {
    const root = DASHBOARD_ROUTES.find((r) => r.path === '');
    expect(root?.data?.['title']).toBe('Dashboard');
  });
});
