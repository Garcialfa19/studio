'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { Route, Alert, Driver } from './definitions';

// Since this is a server-side service, we can use fs.
const routesPath = path.join(process.cwd(), 'src', 'data', 'routes.json');
const alertsPath = path.join(process.cwd(), 'src', 'data', 'alerts.json');
const driversPath = path.join(process.cwd(), 'src', 'data', 'drivers.json');

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
        // If the file doesn't exist, create it with an empty array.
        await fs.writeFile(filePath, '[]', 'utf8');
        return [];
    }
    console.error(`Error reading or parsing file at ${filePath}:`, error);
    return [];
  }
}

export async function getRoutes(): Promise<Route[]> {
  return readData<Route>(routesPath);
}

export async function getAlerts(): Promise<Alert[]> {
  return readData<Alert>(alertsPath);
}

export async function getDrivers(): Promise<Driver[]> {
    return readData<Driver>(driversPath);
}
