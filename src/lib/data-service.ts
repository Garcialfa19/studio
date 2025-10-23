import { promises as fs } from 'fs';
import path from 'path';
import type { Route, Alert } from './definitions';

// Since this is a server-side service, we can use fs.
const routesPath = path.join(process.cwd(), 'src', 'data', 'routes.json');
const alertsPath = path.join(process.cwd(), 'src', 'data', 'alerts.json');

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Error reading or parsing file at ${filePath}:`, error);
    // In a real app, you might want to handle this more gracefully.
    // For this project, returning an empty array if file doesn't exist or is invalid.
    return [];
  }
}

export async function getRoutes(): Promise<Route[]> {
  return readData<Route>(routesPath);
}

export async function getAlerts(): Promise<Alert[]> {
  return readData<Alert>(alertsPath);
}
