export type Route = {
  id: string;
  nombre: string;
  category: "grecia" | "sarchi";
  duracionMin: number;
  tarifaCRC: number;
  imagenHorarioUrl: string;
  imagenTarjetaUrl: string;
  activo: boolean;
  lastUpdated: string;
};

export type Alert = {
  id: string;
  titulo: string;
  lastUpdated: string;
};
