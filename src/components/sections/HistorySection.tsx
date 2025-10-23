
import Image from "next/image";
import { Section, SectionHeader } from "@/components/shared/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Rocket, Gem } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const valueCards = [
  {
    icon: Rocket,
    title: "Misión",
    content: "Brindar un servicio de transporte de personas seguro, confiable y eficiente, contribuyendo al desarrollo de las comunidades que servimos con un equipo humano comprometido y una flota moderna."
  },
  {
    icon: Eye,
    title: "Visión",
    content: "Ser la empresa líder en transporte de la región, reconocida por nuestra excelencia operativa, innovación constante y un profundo compromiso con la satisfacción de nuestros usuarios y el medio ambiente."
  },
  {
    icon: Gem,
    title: "Valores",
    content: "Seguridad, Puntualidad, Honestidad, Respeto y Compromiso Social. Estos pilares guían cada una de nuestras decisiones y acciones diarias."
  },
];

export function HistorySection() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'history-hero');

  return (
    <Section id="historia" className="bg-card">
      <SectionHeader
        title="Nuestra Historia"
        description="Más de medio siglo conectando comunidades y personas."
      />

      <div className="mb-12">
        {heroImage && (
          <div className="relative aspect-video w-full max-w-5xl mx-auto overflow-hidden rounded-lg shadow-xl">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-6 text-lg text-foreground/80 text-justify">
        <p>
          Fundada en 1965 por un grupo de visionarios locales, Autotransportes Santa Gertrudis (ASG) nació con la modesta pero firme misión de conectar los distritos de Grecia, Poás y Sarchí. Con una pequeña flota de autobuses y un inquebrantable espíritu de servicio, comenzamos a trazar las rutas que hoy son vitales para miles de personas.
        </p>
        <p>
          A lo largo de las décadas, hemos crecido junto a nuestras comunidades. Superamos desafíos, modernizamos nuestra flota e integramos nuevas tecnologías, siempre con el objetivo de mejorar la experiencia de viaje de nuestros pasajeros. Hoy, ASG es más que una empresa de transporte; somos parte del tejido social, un vecino confiable que facilita el trabajo, el estudio y el encuentro de las familias de la región.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {valueCards.map(card => (
          <Card key={card.title} className="text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
              <CardTitle className="font-headline mt-4">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
