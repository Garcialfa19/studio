'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Route, Alert, Driver } from './definitions';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'data');

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

async function readJsonData<T>(filename: string): Promise<T[]> {
  const filePath = path.join(dataPath, filename);
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeJsonData(filename: string, data: any): Promise<void> {
  const filePath = path.join(dataPath, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


// --- Route Actions ---
const routeSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  especificacion: z.string().optional().default(''),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(0, "La duración no puede ser negativa."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
});

async function saveFileToLocalServer(file: File | null): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'route-images');
    
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    return `/uploads/route-images/${filename}`;
}


export async function saveRoute(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  const validatedFields = routeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Datos de ruta inválidos.');
  }

  const data = validatedFields.data;
  const routeId = rawData.id ? String(rawData.id) : createSlug(data.nombre);
  const now = new Date().toISOString();

  let routes = await readJsonData<Route>('routes.json');
  const existingRouteIndex = routes.findIndex(r => r.id === routeId);

  let imagenTarjetaUrl = rawData.currentImagenTarjetaUrl as string || '';
  let imagenHorarioUrl = rawData.currentImagenHorarioUrl as string || '';

  const imagenTarjetaFile = formData.get('imagenTarjetaUrl') as File;
  const imagenHorarioFile = formData.get('imagenHorarioUrl') as File;

  const newCardImagePath = await saveFileToLocalServer(imagenTarjetaFile);
  if (newCardImagePath) {
    imagenTarjetaUrl = newCardImagePath;
  }
  
  const newScheduleImagePath = await saveFileToLocalServer(imagenHorarioFile);
  if (newScheduleImagePath) {
    imagenHorarioUrl = newScheduleImagePath;
  }
  
  const routeData: Route = {
    id: routeId,
    nombre: data.nombre,
    especificacion: data.especificacion,
    category: data.category,
    duracionMin: data.duracionMin,
    tarifaCRC: data.tarifaCRC,
    imagenTarjetaUrl: imagenTarjetaUrl,
    imagenHorarioUrl: imagenHorarioUrl,
    lastUpdated: now,
  };

  if (existingRouteIndex > -1) {
    routes[existingRouteIndex] = routeData;
  } else {
    routes.push(routeData);
  }

  await writeJsonData('routes.json', routes);

  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/api/routes');
}


export async function deleteRoute(id: string) {
  let routes = await readJsonData<Route>('routes.json');
  const updatedRoutes = routes.filter(route => route.id !== id);
  await writeJsonData('routes.json', updatedRoutes);
  
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/api/routes');
}


// --- Alert Actions ---
const alertSchema = z.object({
    id: z.string().optional(),
    titulo: z.string().min(1, "El título es requerido."),
});

export async function saveAlert(alertData: Partial<Alert>) {
    const validatedAlert = alertSchema.parse(alertData);
    const now = new Date().toISOString();
    let alerts = await readJsonData<Alert>('alerts.json');

    if (validatedAlert.id) {
        const index = alerts.findIndex(a => a.id === validatedAlert.id);
        if (index > -1) {
            alerts[index] = { ...alerts[index], ...validatedAlert, lastUpdated: now };
        }
    } else {
        const newId = String(Date.now());
        alerts.push({
            id: newId,
            titulo: validatedAlert.titulo,
            lastUpdated: now,
        });
    }

    await writeJsonData('alerts.json', alerts);

    revalidatePath('/admin/dashboard');
    revalidatePath('/alertas');
    revalidatePath('/api/alerts');
}

export async function deleteAlert(id: string) {
    let alerts = await readJsonData<Alert>('alerts.json');
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    await writeJsonData('alerts.json', updatedAlerts);

    revalidatePath('/admin/dashboard');
    revalidatePath('/alertas');
    revalidatePath('/api/alerts');
}


// --- Driver Actions ---
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
    const now = new Date().toISOString();
    let drivers = await readJsonData<Driver>('drivers.json');

    const dataToSave = {
        ...validatedDriver,
        lastUpdated: now,
    };

    if (validatedDriver.id) {
        const index = drivers.findIndex(d => d.id === validatedDriver.id);
        if (index > -1) {
            drivers[index] = { ...drivers[index], ...dataToSave, id: drivers[index].id };
        }
    } else {
        const newId = `d${Date.now()}`;
        drivers.push({
            ...dataToSave,
            id: newId,
        });
    }
    
    await writeJsonData('drivers.json', drivers);

    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}

export async function deleteDriver(id: string) {
    let drivers = await readJsonData<Driver>('drivers.json');
    const updatedDrivers = drivers.filter(driver => driver.id !== id);
    await writeJsonData('drivers.json', updatedDrivers);

    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}


// --- Data Migration Action ---
// This function is now effectively a way to initialize or reset data if needed.
// For now, it will do nothing as data is managed directly.
export async function migrateDataToFirestore() {
  console.log("Data migration is no longer necessary with local JSON storage.");
  return { success: true, message: 'Data is managed locally. No migration needed.' };
}
