
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import type { Route, Alert, Driver } from './definitions';

// --- Data Access Helpers ---
const dataFilePath = (filename: string) => path.join(process.cwd(), 'src', 'data', filename);

async function readData<T>(filename: string): Promise<T[]> {
  try {
    const filePath = dataFilePath(filename);
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    console.error(`Error reading data from ${filename}:`, error);
    throw new Error(`Could not read data from ${filename}.`);
  }
}

async function writeData<T>(filename: string, data: T[]): Promise<void> {
  try {
    const filePath = dataFilePath(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing data to ${filename}:`, error);
    throw new Error(`Could not write data to ${filename}.`);
  }
}

async function saveFile(file: File, subdir: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subdir);
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Sanitize and create a unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(filePath, fileBuffer);

    return `/uploads/${subdir}/${uniqueFilename}`;
}


// --- Route Actions ---

const routeSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido."),
  especificacion: z.string().optional(),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(0, "La duración no puede ser negativa."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
});


export async function saveRoute(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    const validatedFields = routeSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
        throw new Error('Datos de ruta inválidos.');
    }
    
    const { data } = validatedFields;
    const routes = await readData<Route>('routes.json');
    const now = new Date().toISOString();
    
    let imagenTarjetaUrl = formData.get('currentImagenTarjetaUrl') as string || '';
    let imagenHorarioUrl = formData.get('currentImagenHorarioUrl') as string || '';

    const cardImageFile = formData.get('imagenTarjetaUrl') as File | null;
    if (cardImageFile && cardImageFile.size > 0) {
        imagenTarjetaUrl = await saveFile(cardImageFile, 'cards');
    }

    const scheduleImageFile = formData.get('imagenHorarioUrl') as File | null;
    if (scheduleImageFile && scheduleImageFile.size > 0) {
        imagenHorarioUrl = await saveFile(scheduleImageFile, 'schedules');
    }

    if (data.id) {
        // Update existing route
        const index = routes.findIndex(r => r.id === data.id);
        if (index > -1) {
            routes[index] = { 
                ...routes[index], 
                ...data, 
                especificacion: data.especificacion || '',
                imagenTarjetaUrl: imagenTarjetaUrl,
                imagenHorarioUrl: imagenHorarioUrl,
                lastUpdated: now 
            };
        }
    } else {
        // Create new route
        const newRoute: Route = {
            id: data.nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            ...data,
            especificacion: data.especificacion || '',
            imagenTarjetaUrl: imagenTarjetaUrl || "https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen",
            imagenHorarioUrl: imagenHorarioUrl || "https://placehold.co/800x1200/EEE/31343C?text=Sin+Horario",
            lastUpdated: now,
        };
        routes.push(newRoute);
    }

    await writeData('routes.json', routes);
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    revalidatePath('/api/routes');
}


export async function deleteRoute(id: string) {
  let routes = await readData<Route>('routes.json');
  routes = routes.filter(r => r.id !== id);
  await writeData('routes.json', routes);
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
    revalidatePath('/api/alerts');
}

export async function deleteAlert(id: string) {
    let alerts = await readData<Alert>('alerts.json');
    alerts = alerts.filter(a => a.id !== id);
    await writeData('alerts.json', alerts);
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
    revalidatePath('/api/drivers');
}

export async function deleteDriver(id: string) {
    let drivers = await readData<Driver>('drivers.json');
    drivers = drivers.filter(d => d.id !== id);
    await writeData('drivers.json', drivers);
    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}
