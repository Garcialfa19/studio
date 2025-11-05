// THIS FILE IS ONLY FOR SERVER-SIDE USE
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { Route, Alert, Driver } from './definitions';

const dataPath = path.join(process.cwd(), 'src', 'data');

async function readJsonData<T>(filename: string): Promise<T[]> {
  const filePath = path.join(dataPath, filename);
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log(`Data file not found: ${filename}, returning empty array.`);
      return []; // Return empty array if file doesn't exist
    }
    console.error(`Error reading data from ${filename}:`, error);
    throw new Error(`Could not read data from ${filename}.`);
  }
}

export async function getRoutes(): Promise<Route[]> {
    return readJsonData<Route>('routes.json');
}

export async function getAlerts(): Promise<Alert[]> {
    return readJsonData<Alert>('alerts.json');
}

export async function getDrivers(): Promise<Driver[]> {
    return readJsonData<Driver>('drivers.json');
}
