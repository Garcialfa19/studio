"use server";

import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route, Alert, Driver } from "./definitions";

// --- Data Paths ---
const routesPath = path.join(process.cwd(), "src", "data", "routes.json");
const alertsPath = path.join(process.cwd(), "src", "data", "alerts.json");
const driversPath = path.join(process.cwd(), "src", "data", "drivers.json");

// --- Helper Functions ---
async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function saveFile(file: File, subfolder: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    await fs.mkdir(uploadDir, { recursive: true });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await fs.writeFile(filePath, fileBuffer);

    return `/uploads/${subfolder}/${uniqueFilename}`;
}

// --- Contact Form Action ---
const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

export async function submitContactForm(data: z.infer<typeof contactSchema>) {
  try {
    const validatedData = contactSchema.parse(data);
    console.log("New contact form submission:", validatedData);
    // In a real app, you would send an email or save to a database here.
    return { success: true, message: "Form submitted successfully." };
  } catch (error) {
    return { success: false, message: "Validation failed." };
  }
}

// --- Auth Actions ---
const AUTH_COOKIE_NAME = "asg-auth";

export async function authenticate(prevState: { error: string } | undefined, formData: FormData) {
    const username = formData.get("username");
    const password = formData.get("password");

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        cookies().set(AUTH_COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        redirect('/admin/dashboard');
    } else {
        return { error: 'Credenciales inválidas.' };
    }
}

export async function logout() {
    cookies().delete(AUTH_COOKIE_NAME);
    redirect('/admin');
}

// --- Admin CRUD Actions ---

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
  
  // Zod can't parse files from FormData directly, so we handle them separately.
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
    const routes = await readData<Route>(routesPath);
    const data = validation.data;
    
    let existingRoute: Route | undefined;
    if (data.id) {
        existingRoute = routes.find(r => r.id === data.id);
    }

    let imagenHorarioUrl = existingRoute?.imagenHorarioUrl;
    if (data.imagenHorario) {
        imagenHorarioUrl = await saveFile(data.imagenHorario, 'schedules');
    }

    let imagenTarjetaUrl = existingRoute?.imagenTarjetaUrl;
    if (data.imagenTarjeta) {
        imagenTarjetaUrl = await saveFile(data.imagenTarjeta, 'cards');
    }

    const routeData: Omit<Route, 'id'> = {
        nombre: data.nombre,
        category: data.category,
        duracionMin: data.duracionMin,
        tarifaCRC: data.tarifaCRC,
        activo: data.activo,
        imagenHorarioUrl: imagenHorarioUrl || existingRoute?.imagenHorarioUrl || '',
        imagenTarjetaUrl: imagenTarjetaUrl || existingRoute?.imagenTarjetaUrl || '',
        lastUpdated: new Date().toISOString(),
    };

    if (data.id && existingRoute) { // Update
        const index = routes.findIndex(r => r.id === data.id);
        routes[index] = { ...existingRoute, ...routeData };
    } else { // Create
        routes.push({
            ...routeData,
            id: data.nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        });
    }

    await writeData(routesPath, routes);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
      console.error("Error saving route:", error);
      return { success: false, error: "No se pudo procesar la solicitud." };
  }
}

export async function deleteRoute(id: string) {
    let routes = await readData<Route>(routesPath);
    routes = routes.filter(r => r.id !== id);
    await writeData(routesPath, routes);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}

// Schema for Alert validation
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

  const alerts = await readData<Alert>(alertsPath);
  const data = validation.data;

  // Since we removed editing, we only handle creation.
  const newAlert = {
    titulo: data.titulo,
    id: data.titulo.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    lastUpdated: new Date().toISOString(),
  };

  alerts.push(newAlert);
  
  await writeData(alertsPath, alerts);
  revalidatePath("/");
  revalidatePath("/alertas");
  revalidatePath("/admin/dashboard");
  return { success: true };
}


export async function deleteAlert(id: string) {
    let alerts = await readData<Alert>(alertsPath);
    alerts = alerts.filter(a => a.id !== id);
    await writeData(alertsPath, alerts);
    revalidatePath("/");
    revalidatePath("/alertas");
    revalidatePath("/admin/dashboard");
    return { success: true };
}


const driverSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, "El nombre es requerido."),
    routeId: z.string().nullable(),
    status: z.string().optional(),
    comment: z.string().optional(),
});
  

export async function saveDriver(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    // Handle nullable routeId
    if (rawData.routeId === 'null' || rawData.routeId === '') {
        rawData.routeId = null;
    }

    const validation = driverSchema.safeParse(rawData);
  
    if (!validation.success) {
      console.error("Driver validation error:", validation.error.flatten().fieldErrors);
      return { success: false, error: validation.error.flatten().fieldErrors };
    }
  
    try {
      const drivers = await readData<Driver>(driversPath);
      const data = validation.data;
  
      const driverData: Omit<Driver, 'id' | 'lastUpdated'> & { lastUpdated: string } = {
          nombre: data.nombre,
          routeId: data.routeId,
          status: data.status || '',
          comment: data.comment || '',
          lastUpdated: new Date().toISOString(),
      };
  
      if (data.id) { // Update
          const index = drivers.findIndex(d => d.id === data.id);
          if (index > -1) {
              drivers[index] = { ...drivers[index], ...driverData };
          }
      } else { // Create
          drivers.push({
              ...driverData,
              id: data.nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
          });
      }
  
      await writeData(driversPath, drivers);
      revalidatePath("/admin/dashboard");
      return { success: true };
    } catch (error) {
        console.error("Error saving driver:", error);
        return { success: false, error: "No se pudo procesar la solicitud." };
    }
}
  
export async function deleteDriver(id: string) {
    let drivers = await readData<Driver>(driversPath);
    drivers = drivers.filter(d => d.id !== id);
    await writeData(driversPath, drivers);
    revalidatePath("/admin/dashboard");
    return { success: true };
}
