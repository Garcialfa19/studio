import { dataService } from './data-service-client';

export const getAlerts = async () => {
  const snapshot = await dataService.getAlerts();
  const alerts: any[] = [];
  snapshot.forEach(doc => {
    alerts.push({ id: doc.id, ...doc.data() });
  });
  return alerts;
};

export const getRoutes = async () => {
    const snapshot = await dataService.getRoutes();
    const routes: any[] = [];
    snapshot.forEach(doc => {
        routes.push({ id: doc.id, ...doc.data() });
    });
    return routes;
};

export const getDrivers = async () => {
    const snapshot = await dataService.getDrivers();
    const drivers: any[] = [];
    snapshot.forEach(doc => {
        drivers.push({ id: doc.id, ...doc.data() });
    });
    return drivers;
}
