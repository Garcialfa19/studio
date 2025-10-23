export type Route = {
  id: string;
  nombre: string;
  duracionMin: number;
  tarifaCRC: number;
  imagenHorarioUrl: string;
  activo: boolean;
  lastUpdated: string;
};

export type Alert = {
  id: string;
  titulo: string;
  mensaje: string;
  severidad: "info" | "warning" | "critical";
  iniciaISO: string;
  terminaISO: string;
  activo: boolean;
  lastUpdated: string;
};
