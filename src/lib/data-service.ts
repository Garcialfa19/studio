// THIS FILE IS ONLY FOR SERVER-SIDE USE
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { Route, Alert, Driver } from './definitions';

const dataFilePath = (filename: string) => path.join(process.cwd(), 'src', 'data', filename);

async function getData<T>(filename: string): Promise<T[]> {
    try {
        const filePath = dataFilePath(filename);
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as T[];
    } catch (error) {
        console.error(`Could not read ${filename}:`, error);
        return [];
    }
}

export async function getRoutes(): Promise<Route[]> {
    return getData<Route>('routes.json');
}

export async function getAlerts(): Promise<Alert[]> {
    return getData<Alert>('alerts.json');
}

export async function getDrivers(): Promise<Driver[]> {
    return getData<Driver>('drivers.json');
}
