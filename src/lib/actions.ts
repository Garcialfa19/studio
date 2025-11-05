'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Route, Alert, Driver } from './definitions';
import { initializeFirebase } from '@/firebase/server';
import { doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

const routeSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  especificacion: z.string().optional().default(''),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(0, "La duración no puede ser negativa."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
});

// Helper function to save a file to the local server
async function saveFileToLocalServer(file: File | null): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'route-images');
    
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    // Return the public path
    return `/uploads/route-images/${filename}`;
}


export async function saveRoute(formData: FormData) {
  const { firestore } = initializeFirebase();

  const rawData = Object.fromEntries(formData.entries());
  
  const validatedFields = routeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Datos de ruta inválidos.');
  }

  const data = validatedFields.data;
  // Use the name to generate the ID (slug)
  const routeId = createSlug(data.nombre);
  const now = new Date().toISOString();

  let imagenTarjetaUrl = formData.get('currentImagenTarjetaUrl') as string || '';
  let imagenHorarioUrl = formData.get('currentImagenHorarioUrl') as string || '';

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
  
  const routeData: Omit<Route, 'id'> = {
    nombre: data.nombre,
    especificacion: data.especificacion,
    category: data.category,
    duracionMin: data.duracionMin,
    tarifaCRC: data.tarifaCRC,
    imagenTarjetaUrl: imagenTarjetaUrl,
    imagenHorarioUrl: imagenHorarioUrl,
    lastUpdated: now,
  };

  const routeRef = doc(firestore, 'routes', routeId);
  // Use setDoc with merge to create or update the document
  await setDoc(routeRef, routeData, { merge: true });

  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/api/routes');
}


export async function deleteRoute(id: string) {
  const { firestore } = initializeFirebase();
  const routeRef = doc(firestore, 'routes', id);
  await deleteDoc(routeRef);
  
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
    const { firestore } = initializeFirebase();
    const validatedAlert = alertSchema.parse(alertData);
    const now = new Date().toISOString();

    const dataToSave = {
      titulo: validatedAlert.titulo,
      lastUpdated: now,
    };

    if (validatedAlert.id) {
        const alertRef = doc(firestore, 'alerts', validatedAlert.id);
        await updateDoc(alertRef, dataToSave);
    } else {
        await addDoc(collection(firestore, 'alerts'), dataToSave);
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/alertas');
    revalidatePath('/api/alerts');
}

export async function deleteAlert(id: string) {
    const { firestore } = initializeFirebase();
    await deleteDoc(doc(firestore, 'alerts', id));

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
    const { firestore } = initializeFirebase();
    const validatedDriver = driverSchema.parse(driverData);
    const now = new Date().toISOString();

    const dataToSave = {
        ...validatedDriver,
        lastUpdated: now,
    };
    delete (dataToSave as any).id;


    if (validatedDriver.id) {
        const driverRef = doc(firestore, 'drivers', validatedDriver.id);
        await updateDoc(driverRef, dataToSave);
    } else {
        await addDoc(collection(firestore, 'drivers'), dataToSave);
    }
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}

export async function deleteDriver(id: string) {
    const { firestore } = initializeFirebase();
    await deleteDoc(doc(firestore, 'drivers', id));

    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}


// --- Data Migration Action ---
async function readJsonData(filename: string) {
  const filePath = require('path').join(process.cwd(), 'src', 'data', filename);
  try {
    const jsonData = await require('fs').promises.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function migrateDataToFirestore() {
  const { firestore } = initializeFirebase();

  try {
    const routes = await readJsonData('routes.json');
    const alerts = await readJsonData('alerts.json');
    const drivers = await readJsonData('drivers.json');
    
    if (routes.length === 0 && alerts.length === 0 && drivers.length === 0) {
      return { success: true, message: 'No data found in JSON files to migrate.' };
    }

    const batch = writeBatch(firestore);

    routes.forEach((item: Route) => {
      const docId = item.id || createSlug(item.nombre);
      const { id, ...data } = item;
      const docRef = doc(firestore, 'routes', docId);
      batch.set(docRef, data);
    });

    alerts.forEach((item: Alert) => {
      const { id, ...data } = item;
      const docRef = doc(firestore, 'alerts', id);
      batch.set(docRef, data);
    });

    drivers.forEach((item: Driver) => {
      const { id, ...data } = item;
      const docRef = doc(firestore, 'drivers', id);
      batch.set(docRef, data);
    });

    await batch.commit();
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/');

    return { success: true, message: 'Data migrated to Firestore successfully.' };
  } catch (error: any) {
    console.error("Migration failed:", error);
    return { success: false, error: error.message || 'An unknown error occurred during migration.' };
  }
}
