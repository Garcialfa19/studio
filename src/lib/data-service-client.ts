
import type { Route, Alert, Driver } from './definitions';

// --- API Utility ---
type ApiError = {
  message: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) { // No Content
      return undefined as T;
    }
    const data = await response.json();
    return data as T;
  } else {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new Error(errorMessage);
  }
}


// --- Route Service ---
export const getRoutes = () => fetch('/api/routes').then(res => handleResponse<Route[]>(res));

export const createRoute = (data: FormData) => fetch('/api/routes', {
  method: 'POST',
  body: data,
}).then(res => handleResponse<Route>(res));

export const updateRoute = (id: string, data: FormData) => fetch(`/api/routes/${id}`, {
  method: 'PUT',
  body: data,
}).then(res => handleResponse<Route>(res));

export const deleteRoute = (id: string) => fetch(`/api/routes/${id}`, { method: 'DELETE' }).then(res => handleResponse<void>(res));


// --- Alert Service ---
export type CreateAlertPayload = Omit<Alert, 'id' | 'lastUpdated'>;

export const getAlerts = () => fetch('/api/alerts').then(res => handleResponse<Alert[]>(res));

export const createAlert = (alertData: CreateAlertPayload) => fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(alertData),
}).then(res => handleResponse<Alert>(res));

export const deleteAlert = (id: string) => fetch(`/api/alerts/${id}`, { method: 'DELETE' }).then(res => handleResponse<void>(res));


// --- Driver Service ---
export type CreateDriverPayload = Omit<Driver, 'id' | 'lastUpdated'>;
export type UpdateDriverPayload = Partial<Omit<Driver, 'id' | 'lastUpdated'>>;

export const getDrivers = () => fetch('/api/drivers').then(res => handleResponse<Driver[]>(res));

export const createDriver = (driverData: CreateDriverPayload) => fetch('/api/drivers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(driverData),
}).then(res => handleResponse<Driver>(res));

export const updateDriver = (id: string, driverData: UpdateDriverPayload) => fetch(`/api/drivers/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(driverData),
}).then(res => handleResponse<Driver>(res));

export const deleteDriver = (id: string) => fetch(`/api/drivers/${id}`, { method: 'DELETE' }).then(res => handleResponse<void>(res));
