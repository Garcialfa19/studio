'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Route, Alert, Driver } from './definitions';
import { initializeFirebaseAdmin } from '@/firebase/admin';
import { getFirestore, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, collection } from 'firebase/firestore';

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

async function uploadFileToStorage(file: File): Promise<string> {
    const admin = initializeFirebaseAdmin();
    const bucket = admin.storage().bucket();
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageFile = bucket.file(`route-images/${filename}`);

    await storageFile.save(buffer, {
        metadata: {
            contentType: file.type,
        },
    });

    return storageFile.publicUrl();
}

export async function saveRoute(formData: FormData) {
  const admin = initializeFirebaseAdmin();
  const firestore = admin.firestore();

  const id = formData.get('id') as string | null;
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = routeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Datos de ruta inválidos.');
  }

  const data = validatedFields.data;
  const routeId = id || createSlug(data.nombre);
  const now = new Date().toISOString();

  let imagenTarjetaUrl = formData.get('currentImagenTarjetaUrl') as string || '';
  let imagenHorarioUrl = formData.get('currentImagenHorarioUrl') as string || '';

  const imagenTarjetaFile = formData.get('imagenTarjetaUrl') as File;
  const imagenHorarioFile = formData.get('imagenHorarioUrl') as File;

  if (imagenTarjetaFile && imagenTarjetaFile.size > 0) {
      imagenTarjetaUrl = await uploadFileToStorage(imagenTarjetaFile);
  }

  if (imagenHorarioFile && imagenHorarioFile.size > 0) {
      imagenHorarioUrl = await uploadFileToStorage(imagenHorarioFile);
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

  const routeRef = firestore.collection('routes').doc(routeId);
  await routeRef.set(routeData, { merge: true });

  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/api/routes');
}


export async function deleteRoute(id: string) {
  const admin = initializeFirebaseAdmin();
  const firestore = admin.firestore();
  await firestore.collection('routes').doc(id).delete();
  
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
    const { firestore } = initializeFirebaseAdmin();
    const validatedAlert = alertSchema.parse(alertData);
    const now = new Date().toISOString();

    const dataToSave = {
      titulo: validatedAlert.titulo,
      lastUpdated: now,
    };

    if (validatedAlert.id) {
        const alertRef = firestore.collection('alerts').doc(validatedAlert.id);
        await alertRef.update(dataToSave);
    } else {
        await firestore.collection('alerts').add(dataToSave);
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/alertas');
    revalidatePath('/api/alerts');
}

export async function deleteAlert(id: string) {
    const { firestore } = initializeFirebaseAdmin();
    await firestore.collection('alerts').doc(id).delete();

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
    const { firestore } = initializeFirebaseAdmin();
    const validatedDriver = driverSchema.parse(driverData);
    const now = new Date().toISOString();

    const dataToSave = {
        ...validatedDriver,
        lastUpdated: now,
    };
    delete (dataToSave as any).id;


    if (validatedDriver.id) {
        const driverRef = firestore.collection('drivers').doc(validatedDriver.id);
        await driverRef.update(dataToSave);
    } else {
        await firestore.collection('drivers').add(dataToSave);
    }
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/api/drivers');
}

export async function deleteDriver(id: string) {
    const { firestore } = initializeFirebaseAdmin();
    await firestore.collection('drivers').doc(id).delete();

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
  const { firestore } = initializeFirebaseAdmin();

  try {
    const routes = await readJsonData('routes.json');
    const alerts = await readJsonData('alerts.json');
    const drivers = await readJsonData('drivers.json');
    
    if (routes.length === 0 && alerts.length === 0 && drivers.length === 0) {
      return { success: true, message: 'No data found in JSON files to migrate.' };
    }

    const batch = firestore.batch();

    routes.forEach((item: Route) => {
      const docId = createSlug(item.nombre);
      const { id, ...data } = item;
      const docRef = firestore.collection('routes').doc(docId);
      batch.set(docRef, data);
    });

    alerts.forEach((item: Alert) => {
      const { id, ...data } = item;
      const docRef = firestore.collection('alerts').doc(id);
      batch.set(docRef, data);
    });

    drivers.forEach((item: Driver) => {
      const { id, ...data } = item;
      const docRef = firestore.collection('drivers').doc(id);
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
