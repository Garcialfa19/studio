
import { db } from '@/lib/firebase-admin';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore/lite';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const routesCollection = collection(db, 'routes');

// --- Helper Functions ---
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

async function saveFileToLocalServer(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'route-images');
    
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    return `/uploads/route-images/${filename}`;
}

// --- Zod Schema for Validation ---
const routeSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  especificacion: z.string().optional().default(''),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(0, "La duración no puede ser negativa."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
});


// --- API Handlers ---

export async function GET() {
  try {
    const snapshot = await getDocs(routesCollection);
    const routes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json({ message: 'Error al obtener las rutas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = routeSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return NextResponse.json({ message: 'Datos de ruta inválidos', errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
    }

    const { nombre, ...rest } = validatedFields.data;

    const id = createSlug(nombre);
    const routeRef = doc(db, 'routes', id);

    // Handle file uploads
    const imagenTarjetaFile = formData.get('imagenTarjetaUrl') as File | null;
    const imagenHorarioFile = formData.get('imagenHorarioUrl') as File | null;
    
    let imagenTarjetaUrl = '';
    if (imagenTarjetaFile && imagenTarjetaFile.size > 0) {
        imagenTarjetaUrl = await saveFileToLocalServer(imagenTarjetaFile);
    }

    let imagenHorarioUrl = '';
    if (imagenHorarioFile && imagenHorarioFile.size > 0) {
        imagenHorarioUrl = await saveFileToLocalServer(imagenHorarioFile);
    }

    const newRoute = {
      id,
      nombre,
      ...rest,
      imagenTarjetaUrl,
      imagenHorarioUrl,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(routeRef, newRoute);

    return NextResponse.json(newRoute, { status: 201 });

  } catch (error: any) {
    console.error("Error creating route:", error);
    return NextResponse.json({ message: error.message || 'Error al crear la ruta' }, { status: 500 });
  }
}
