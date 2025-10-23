"use server";

import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route, Alert } from "./definitions";

// --- Data Paths ---
const routesPath = path.join(process.cwd(), "src", "data", "routes.json");
const alertsPath = path.join(process.cwd(), "src", "data", "alerts.json");

// --- Helper Functions ---
async function readData<T>(filePath: string): Promise<T[]> {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
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

export async function authenticate(formData: FormData) {
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

// Schema for Route validation
const routeSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, "El nombre es requerido."),
  duracionMin: z.coerce.number().min(1, "La duración debe ser positiva."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
  imagenHorarioUrl: z.string().min(1, "La URL de la imagen es requerida."),
  activo: z.coerce.boolean(),
});

export async function saveRoute(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validation = routeSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  const routes = await readData<Route>(routesPath);
  const data = validation.data;
  const newRoute = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  if (data.id) { // Update
    const index = routes.findIndex(r => r.id === data.id);
    if (index !== -1) {
      routes[index] = { ...routes[index], ...newRoute };
    }
  } else { // Create
    routes.push({
      ...newRoute,
      id: newRoute.nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    });
  }

  await writeData(routesPath, routes);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { success: true };
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
  mensaje: z.string().min(10, "El mensaje es requerido."),
  severidad: z.enum(["info", "warning", "critical"]),
  iniciaISO: z.string().datetime("Formato de fecha inválido."),
  terminaISO: z.string().datetime("Formato de fecha inválido."),
  activo: z.coerce.boolean(),
});

export async function saveAlert(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validation = alertSchema.safeParse(rawData);

  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  const alerts = await readData<Alert>(alertsPath);
  const data = validation.data;
  const newAlert = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  if (data.id) { // Update
    const index = alerts.findIndex(a => a.id === data.id);
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...newAlert };
    }
  } else { // Create
    alerts.push({
      ...newAlert,
      id: newAlert.titulo.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    });
  }

  await writeData(alertsPath, alerts);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { success: true };
}


export async function deleteAlert(id: string) {
    let alerts = await readData<Alert>(alertsPath);
    alerts = alerts.filter(a => a.id !== id);
    await writeData(alertsPath, alerts);
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { success: true };
}
