"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { Section, SectionHeader } from "@/components/shared/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/lib/actions";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

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
  const { toast } = useToast();
  const mapImage = PlaceHolderImages.find(img => img.id === 'map-placeholder');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    const result = await submitContactForm(data);
    if (result.success) {
      toast({
        title: "Mensaje Enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      form.reset();
    } else {
      toast({
        title: "Error al enviar",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Section id="contacto">
      <SectionHeader title="Contacto" description="Estamos aquí para ayudarte. Ponte en contacto con nosotros." />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Card className="flex flex-col">
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
        
        <Card>
          <CardContent className="p-8">
             <h3 className="text-2xl font-headline font-semibold mb-6">Envíanos un Mensaje</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Escribe tu consulta aquí..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
