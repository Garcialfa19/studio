'use client';
import type { Route, Alert, Driver } from './definitions';

async function fetchData<T>(endpoint: string): Promise<T[]> {
    try {
        const response = await fetch(`/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
}

export async function getRoutes(): Promise<Route[]> {
    return fetchData<Route>('routes');
}

export async function getAlerts(): Promise<Alert[]> {
    return fetchData<Alert>('alerts');
}

export async function getDrivers(): Promise<Driver[]> {
    return fetchData<Driver>('drivers');
}
