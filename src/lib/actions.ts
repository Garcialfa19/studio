"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getFirestore, collection, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from '@/firebase';
import type { Route, Alert, Driver } from "./definitions";

// --- Initialize Firebase ---
const { firestore, app } = initializeFirebase();
const storage = getStorage(app);

// --- Helper Functions ---
async function saveFile(file: File, subfolder: string): Promise<string> {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `uploads/${subfolder}/${uniqueFilename}`);
    
    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

// --- Route Actions ---
const routeFormSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, "El nombre es requerido."),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(1, "La duración debe ser positiva."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
  activo: z.coerce.boolean(),
  imagenHorario: z.instanceof(File).optional(),
  imagenTarjeta: z.instanceof(File).optional(),
});

export async function saveRoute(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  const fileValidation = {
      imagenHorario: rawData.imagenHorario instanceof File ? rawData.imagenHorario : undefined,
      imagenTarjeta: rawData.imagenTarjeta instanceof File ? rawData.imagenTarjeta : undefined,
  }
  
  const validation = routeFormSchema.safeParse({ ...rawData, ...fileValidation });

  if (!validation.success) {
    console.error(validation.error.flatten().fieldErrors);
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    
    const routesCollection = collection(firestore, 'routes');
    let routeDocRef;
    let existingData = {};

    if (data.id) {
        routeDocRef = doc(routesCollection, data.id);
        const routeSnap = await (await import('firebase/firestore')).getDoc(routeDocRef);
        if(routeSnap.exists()) {
            existingData = routeSnap.data();
        }
    } else {
        routeDocRef = doc(routesCollection); // Let Firestore generate ID
    }

    let imagenHorarioUrl = (existingData as Route)?.imagenHorarioUrl;
    if (data.imagenHorario) {
        imagenHorarioUrl = await saveFile(data.imagenHorario, 'schedules');
    }

    let imagenTarjetaUrl = (existingData as Route)?.imagenTarjetaUrl;
    if (data.imagenTarjeta) {
        imagenTarjetaUrl = await saveFile(data.imagenTarjeta, 'cards');
    }

    const routeData = {
        nombre: data.nombre,
        category: data.category,
        duracionMin: data.duracionMin,
        tarifaCRC: data.tarifaCRC,
        activo: data.activo,
        imagenHorarioUrl: imagenHorarioUrl || '',
        imagenTarjetaUrl: imagenTarjetaUrl || 'https://picsum.photos/seed/bus-default/600/400',
        lastUpdated: new Date().toISOString(),
    };

    await setDoc(routeDocRef, routeData, { merge: true });

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
      console.error("Error saving route:", error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo procesar la solicitud.";
      return { success: false, error: errorMessage };
  }
}

export async function deleteRoute(id: string) {
    try {
        const routeDocRef = doc(firestore, 'routes', id);
        await deleteDoc(routeDocRef);
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting route:", error);
        return { success: false, error: "No se pudo eliminar la ruta." };
    }
}


// --- Alert Actions ---
const alertSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(3, "El título es requerido."),
});

export async function saveAlert(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validation = alertSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    const alertsCollection = collection(firestore, 'alerts');
    
    const alertData = {
      titulo: data.titulo,
      lastUpdated: new Date().toISOString(),
    };

    if (data.id) { // This part is for editing, but current UI only adds.
      await setDoc(doc(alertsCollection, data.id), alertData, { merge: true });
    } else {
      await addDoc(alertsCollection, alertData);
    }

    revalidatePath("/");
    revalidatePath("/alertas");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch(error) {
    console.error("Error saving alert:", error);
    return { success: false, error: "No se pudo guardar la alerta." };
  }
}

export async function deleteAlert(id: string) {
    try {
        await deleteDoc(doc(firestore, 'alerts', id));
        revalidatePath("/");
        revalidatePath("/alertas");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting alert:", error);
        return { success: false, error: "No se pudo eliminar la alerta." };
    }
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

export async function saveDriver(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    if (rawData.routeId === 'null' || rawData.routeId === '') {
        rawData.routeId = null;
    }

    const validation = driverSchema.safeParse(rawData);
  
    if (!validation.success) {
      console.error("Driver validation error:", validation.error.flatten().fieldErrors);
      return { success: false, error: validation.error.flatten().fieldErrors };
    }
  
    try {
      const data = validation.data;
      const driversCollection = collection(firestore, 'drivers');
      
      const driverData = {
          nombre: data.nombre,
          busPlate: data.busPlate || '',
          routeId: data.routeId,
          status: data.status || '',
          comment: data.comment || '',
          lastUpdated: new Date().toISOString(),
      };

      let docRef;
      if (data.id) {
          docRef = doc(driversCollection, data.id);
          await setDoc(docRef, driverData, { merge: true });
      } else {
          docRef = await addDoc(driversCollection, driverData);
      }
  
      revalidatePath("/admin/dashboard");
      return { success: true };
    } catch (error) {
        console.error("Error saving driver:", error);
        return { success: false, error: "No se pudo procesar la solicitud." };
    }
}
  
export async function deleteDriver(id: string) {
    try {
      await deleteDoc(doc(firestore, 'drivers', id));
      revalidatePath("/admin/dashboard");
      return { success: true };
    } catch(error) {
      console.error("Error deleting driver:", error);
      return { success: false, error: "No se pudo eliminar el chofer." };
    }
}