
import { db } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// --- Helper Functions ---
async function saveFileToLocalServer(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'route-images');
    
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    return `/uploads/route-images/${filename}`;
}

// --- Zod Schema for Validation (Update doesn't require name) ---
const routeUpdateSchema = z.object({
  especificacion: z.string().optional().default(''),
  category: z.enum(["grecia", "sarchi"]),
  duracionMin: z.coerce.number().min(0, "La duración no puede ser negativa."),
  tarifaCRC: z.coerce.number().min(0, "La tarifa no puede ser negativa."),
  currentImagenTarjetaUrl: z.string().optional(),
  currentImagenHorarioUrl: z.string().optional(),
});


// --- API Handlers ---

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const routeRef = doc(db, 'routes', params.id);

    const currentDoc = await getDoc(routeRef);
    if (!currentDoc.exists()) {
        return NextResponse.json({ message: "Ruta no encontrada." }, { status: 404 });
    }

    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = routeUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return NextResponse.json({ message: 'Datos de ruta inválidos', errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
    }

    // Handle file uploads
    const imagenTarjetaFile = formData.get('imagenTarjetaUrl') as File | null;
    const imagenHorarioFile = formData.get('imagenHorarioUrl') as File | null;

    let imagenTarjetaUrl = validatedFields.data.currentImagenTarjetaUrl || '';
    if (imagenTarjetaFile && imagenTarjetaFile.size > 0) {
        imagenTarjetaUrl = await saveFileToLocalServer(imagenTarjetaFile);
    }

    let imagenHorarioUrl = validatedFields.data.currentImagenHorarioUrl || '';
    if (imagenHorarioFile && imagenHorarioFile.size > 0) {
        imagenHorarioUrl = await saveFileToLocalServer(imagenHorarioFile);
    }

    const updatedData = {
        ...validatedFields.data,
        imagenTarjetaUrl,
        imagenHorarioUrl,
        lastUpdated: new Date().toISOString(),
    };
    
    // Remove fields that are not part of the DB model
    delete updatedData.currentImagenHorarioUrl;
    delete updatedData.currentImagenTarjetaUrl;

    await setDoc(routeRef, updatedData, { merge: true });

    const finalDoc = await getDoc(routeRef);

    return NextResponse.json(finalDoc.data());

  } catch (error: any) {
    console.error(`Error updating route ${params.id}:`, error);
    return NextResponse.json({ message: error.message || 'Error al actualizar la ruta' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routeRef = doc(db, 'routes', params.id);
    await deleteDoc(routeRef);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting route ${params.id}:`, error);
    return NextResponse.json({ message: 'Error al eliminar la ruta' }, { status: 500 });
  }
}
