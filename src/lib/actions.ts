'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { Route, Alert, Driver } from './definitions';

const dataFilePath = (filename: string) => path.join(process.cwd(), 'src', 'data', filename);

// Helper function to read data
async function readData<T>(filename: string): Promise<T[]> {
  try {
    const filePath = dataFilePath(filename);
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write data
async function writeData<T>(filename: string, data: T[]): Promise<void> {
  const filePath = dataFilePath(filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


// Route Actions
const routeSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido."),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number(),
  tarifaCRC: z.coerce.number(),
  imagenHorarioUrl: z.string().optional(),
  imagenTarjetaUrl: z.string().optional(),
  activo: z.boolean(),
});

export async function saveRoute(routeData: Partial<Route>) {
  const validatedRoute = routeSchema.parse(routeData);
  const routes = await readData<Route>('routes.json');
  const now = new Date().toISOString();

  if (validatedRoute.id) {
    // Update existing route
    const index = routes.findIndex(r => r.id === validatedRoute.id);
    if (index > -1) {
      routes[index] = { ...routes[index], ...validatedRoute, lastUpdated: now };
    }
  } else {
    // Create new route
    const newRoute: Route = {
      id: validatedRoute.nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      ...validatedRoute,
      lastUpdated: now,
    };
    routes.push(newRoute);
  }

  await writeData('routes.json', routes);
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
}

export async function deleteRoute(id: string) {
  let routes = await readData<Route>('routes.json');
  routes = routes.filter(r => r.id !== id);
  await writeData('routes.json', routes);
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
}

// Alert Actions
const alertSchema = z.object({
    id: z.string().optional(),
    titulo: z.string().min(1, "El título es requerido."),
});

export async function saveAlert(alertData: Partial<Alert>) {
    const validatedAlert = alertSchema.parse(alertData);
    const alerts = await readData<Alert>('alerts.json');
    const now = new Date().toISOString();

    if (validatedAlert.id) {
        const index = alerts.findIndex(a => a.id === validatedAlert.id);
        if (index > -1) {
            alerts[index] = { ...alerts[index], ...validatedAlert, lastUpdated: now };
        }
    } else {
        const newAlert: Alert = {
            id: String(Date.now()),
            ...validatedAlert,
            lastUpdated: now,
        };
        alerts.push(newAlert);
    }

    await writeData('alerts.json', alerts);
    revalidatePath('/admin/dashboard');
    revalidatePath('/alertas');
}

export async function deleteAlert(id: string) {
    let alerts = await readData<Alert>('alerts.json');
    alerts = alerts.filter(a => a.id !== id);
    await writeData('alerts.json', alerts);
    revalidatePath('/admin/dashboard');
    revalidatePath('/alertas');
}


// Driver Actions
const driverSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre es requerido."),
    busPlate: z.string().optional(),
    routeId: z.string().nullable(),
    status: z.string().optional(),
    comment: z.string().optional(),
});

export async function saveDriver(driverData: Partial<Driver>) {
    const validatedDriver = driverSchema.parse(driverData);
    const drivers = await readData<Driver>('drivers.json');
    const now = new Date().toISOString();

    if (validatedDriver.id) {
        const index = drivers.findIndex(d => d.id === validatedDriver.id);
        if (index > -1) {
            drivers[index] = { ...drivers[index], ...validatedDriver, lastUpdated: now };
        }
    } else {
        const newDriver: Driver = {
            id: 'd' + String(Date.now()),
            ...validatedDriver,
            lastUpdated: now,
        };
        drivers.push(newDriver);
    }
    
    await writeData('drivers.json', drivers);
    revalidatePath('/admin/dashboard');
}

export async function deleteDriver(id: string) {
    let drivers = await readData<Driver>('drivers.json');
    drivers = drivers.filter(d => d.id !== id);
    await writeData('drivers.json', drivers);
    revalidatePath('/admin/dashboard');
}
