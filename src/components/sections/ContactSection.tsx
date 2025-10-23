
"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const contactInfo = [
  { icon: Phone, text: "+506 2494-1234", href: "tel:+50624941234" },
  { icon: Mail, text: "info@asg.cr", href: "mailto:info@asg.cr" },
  { icon: MapPin, text: "Grecia, Alajuela, Costa Rica" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export function ContactSection() {
  const mapImage = PlaceHolderImages.find(img => img.id === 'map-placeholder');

  return (
    <Section id="contacto">
      <SectionHeader title="Contacto" description="Estamos aquí para ayudarte. Ponte en contacto con nosotros." />
      <div className="flex justify-center">
        <Card className="flex flex-col max-w-2xl w-full">
          <CardContent className="p-8 flex-grow flex flex-col">
            <h3 className="text-2xl font-headline font-semibold mb-6">Información de Contacto</h3>
            <ul className="space-y-4 text-lg mb-8">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-center gap-4">
                  <item.icon className="h-6 w-6 text-primary" />
                  {item.href ? (
                    <a href={item.href} className="hover:underline">{item.text}</a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-4 mb-8">
              {socialLinks.map((social) => (
                <Button key={social.label} variant="outline" size="icon" asChild>
                  <a href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
            {mapImage && (
              <div className="mt-auto aspect-video w-full overflow-hidden rounded-md shadow-md">
                <Image
                  src={mapImage.imageUrl}
                  alt={mapImage.description}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  data-ai-hint={mapImage.imageHint}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
