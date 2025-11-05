'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';
import type { Route, Alert, Driver } from './definitions';
import { initializeFirebase as initializeServerFirebase } from '@/firebase/server';
import { getFirestore, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, collection } from 'firebase/firestore';

// --- Data Access Helpers ---
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};


// --- Route Actions ---

const routeSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  especificacion: z.string().optional().default(''),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(0, "La duración no puede ser negativa."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
});

export async function saveRoute(formData: FormData) {
    const { firestore } = initializeServerFirebase();
    const rawData = Object.fromEntries(formData.entries());
    
    const validatedFields = routeSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
        throw new Error('Datos de ruta inválidos.');
    }
    
    const { data } = validatedFields;
    const now = new Date().toISOString();
    
    const routeId = createSlug(data.nombre);
    
    const routeData: Omit<Route, 'id'> = {
        nombre: data.nombre,
        especificacion: data.especificacion,
        category: data.category,
        duracionMin: data.duracionMin,
        tarifaCRC: data.tarifaCRC,
        imagenTarjetaUrl: "/uploads/cards/index-07.jpg",
        imagenHorarioUrl: "/uploads/cards/index-07.jpg",
        lastUpdated: now,
    };
    
    const routeRef = doc(firestore, 'routes', routeId);
    await setDoc(routeRef, routeData, { merge: true });


    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    revalidatePath('/api/routes');
}


export async function deleteRoute(id: string) {
  const { firestore } = initializeServerFirebase();
  await deleteDoc(doc(firestore, 'routes', id));
  
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
    const { firestore } = initializeServerFirebase();
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
    const { firestore } = initializeServerFirebase();
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
    const { firestore } = initializeServerFirebase();
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
    const { firestore } = initializeServerFirebase();
    await deleteDoc(doc(firestore, 'drivers', id));

    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}


// --- Data Migration Action ---
async function readJsonData(filename: string) {
  const filePath = path.join(process.cwd(), 'src', 'data', filename);
  try {
    const jsonData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function migrateDataToFirestore() {
  const { firestore } = initializeServerFirebase();

  try {
    const routes = await readJsonData('routes.json');
    const alerts = await readJsonData('alerts.json');
    const drivers = await readJsonData('drivers.json');
    
    if (routes.length === 0 && alerts.length === 0 && drivers.length === 0) {
      return { success: true, message: 'No data found in JSON files to migrate.' };
    }

    const batch = writeBatch(firestore);

    routes.forEach((item: Route) => {
      const docId = createSlug(item.nombre);
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
