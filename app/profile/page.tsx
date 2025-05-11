"use client";

import DashboardHeader from "@/components/dashboard-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Github,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Save,
  Trophy,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  lastName: z
    .string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  username: z.string().min(2, {
    message: "El nombre de usuario debe tener al menos 2 caracteres.",
  }),
  email: z
    .string()
    .email({ message: "Por favor, introduce un email válido." })
    .optional(),
  bio: z
    .string()
    .max(500, { message: "La biografía no puede exceder los 500 caracteres." })
    .optional(),
  location: z.string().optional(),
  website: z
    .string()
    .url({ message: "Por favor, introduce una URL válida." })
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url({ message: "Por favor, introduce una URL válida." })
    .optional()
    .or(z.literal("")),
  skills: z.array(z.string()).optional(),
  available: z.boolean(),
});

const skills = [
  { id: "frontend", label: "Desarrollo Frontend" },
  { id: "backend", label: "Desarrollo Backend" },
  { id: "mobile", label: "Desarrollo Móvil" },
  { id: "ui", label: "Diseño UI/UX" },
  { id: "data", label: "Ciencia de Datos" },
  { id: "ai", label: "IA/Machine Learning" },
  { id: "devops", label: "DevOps" },
  { id: "blockchain", label: "Blockchain" },
  { id: "cloud", label: "Cloud Computing" },
  { id: "security", label: "Ciberseguridad" },
  { id: "product", label: "Product Management" },
  { id: "game", label: "Desarrollo de Videojuegos" },
];

export interface UnsafeMetadata {
  bio: string;
  location: string;
  website: string;
  githubUrl: string;
  skills: string[];
  available: boolean;
  avatar: string;
  hackathons: number;
  projects: number;
  teams: number;
}

export default function ProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const { user } = useUser();
  const metadata = user?.unsafeMetadata as Partial<UnsafeMetadata> | undefined;

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      bio: metadata?.bio || "",
      location: metadata?.location || "",
      website: metadata?.website || "",
      githubUrl: metadata?.githubUrl || "",
      skills: metadata?.skills || [],
      available: metadata?.available || false,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.emailAddresses?.[0]?.emailAddress || "",
        bio: metadata?.bio || "",
        location: metadata?.location || "",
        website: metadata?.website || "",
        githubUrl: metadata?.githubUrl || "",
        skills: metadata?.skills || [],
        available: metadata?.available || false,
      });
    }
  }, [user, metadata, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true);

    try {
      if (user) {
        const updates: Record<string, unknown> = {};
        if (values.firstName !== user.firstName)
          updates.firstName = values.firstName;
        if (values.lastName !== user.lastName)
          updates.lastName = values.lastName;

        const newUnsafeMetadata: Record<string, unknown> = {};
        if (values.bio !== metadata?.bio) newUnsafeMetadata.bio = values.bio;
        if (values.location !== metadata?.location)
          newUnsafeMetadata.location = values.location;
        if (values.website !== metadata?.website)
          newUnsafeMetadata.website = values.website;
        if (values.githubUrl !== metadata?.githubUrl)
          newUnsafeMetadata.githubUrl = values.githubUrl;
        if (
          JSON.stringify(values.skills || []) !==
          JSON.stringify(metadata?.skills || [])
        )
          newUnsafeMetadata.skills = values.skills;
        if (values.available !== metadata?.available)
          newUnsafeMetadata.available = values.available;

        if (Object.keys(newUnsafeMetadata).length > 0) {
          updates.unsafeMetadata = {
            ...user.unsafeMetadata,
            ...newUnsafeMetadata,
          };
        }

        if (Object.keys(updates).length > 0) {
          await user.update(updates);
        }
      }
      setActiveTab("preview");
    } catch (error) {
      console.error("Error al guardar en Clerk:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAvatarChange(
    e: React.ChangeEvent<HTMLInputElement>,
    user: UserResource | null | undefined,
    setIsAvatarUploading: (v: boolean) => void
  ) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsAvatarUploading(true);
    try {
      await user.setProfileImage({ file });
    } catch (err) {
      console.error("Error al subir avatar:", err);
    } finally {
      setIsAvatarUploading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 container mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tu Perfil</h2>
            <p className="text-muted-foreground">
              Gestiona tu información personal y habilidades para encontrar los
              mejores equipos
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="edit"
          className="space-y-4"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="edit">Editar Perfil</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tu Avatar</CardTitle>
                  <CardDescription>
                    Esta imagen te representa en la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={user?.hasImage ? user?.imageUrl : "/placeholder.svg"}
                      alt={user?.fullName || "Avatar"}
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.fullName ? user.fullName.charAt(0) : ""}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    id="avatar-upload"
                    onChange={(e) =>
                      handleAvatarChange(e, user, setIsAvatarUploading)
                    }
                    disabled={isAvatarUploading}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    disabled={isAvatarUploading}
                  >
                    {isAvatarUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Cambiar Avatar
                      </>
                    )}
                  </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 items-start">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {metadata?.hackathons || 0} Hackathons
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {metadata?.projects || 0} Proyectos
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {metadata?.teams || 0} Equipos
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Miembro desde{" "}
                    {user?.createdAt
                      ? user.createdAt.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Fecha no disponible"}
                  </p>
                </CardFooter>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid gap-4 xl:grid-cols-3 grid-cols-1">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu apellido" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="username"
                          disabled
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de Usuario</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tu nombre de usuario"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Tu email"
                                {...field}
                                disabled
                              />
                            </FormControl>
                            <FormDescription>
                              Tu email no puede ser cambiado. Contacta con
                              soporte si necesitas actualizarlo.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografía</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Cuéntanos sobre ti, tu experiencia y qué buscas en un equipo de hackathon..."
                                className="resize-none min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Máximo 500 caracteres. {field.value?.length || 0}
                              /500
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 xl:grid-cols-2 grid-cols-1">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ubicación</FormLabel>
                              <FormControl>
                                <Input placeholder="Ciudad, País" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sitio Web</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://tu-sitio.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="githubUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://github.com/username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Habilidades
                        </h3>
                        <div className="grid grid-cols-2 xl:grid-cols-3 lg:grid-cols-2 gap-3">
                          {skills.map((skill) => (
                            <FormField
                              key={skill.id}
                              control={form.control}
                              name="skills"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={skill.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          skill.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          const currentValues =
                                            field.value || [];
                                          return checked
                                            ? field.onChange([
                                                ...currentValues,
                                                skill.id,
                                              ])
                                            : field.onChange(
                                                currentValues?.filter(
                                                  (value) => value !== skill.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {skill.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="available"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Disponible para Hackathons
                              </FormLabel>
                              <FormDescription>
                                Activa esta opción si estás buscando unirte a
                                equipos para próximos hackathons.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                name="available"
                                id="available"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center md:items-start space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={
                          user?.hasImage ? user?.imageUrl : "/placeholder.svg"
                        }
                        alt={user?.fullName || "Avatar"}
                      />
                      <AvatarFallback className="text-2xl">
                        {user?.fullName?.charAt(0) ?? ""}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold">
                        {form.getValues("firstName")}{" "}
                        {form.getValues("lastName")}
                      </h2>
                      <p className="text-muted-foreground">
                        @{form.getValues("username")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {form.getValues("available") && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Disponible
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {metadata?.hackathons || "0"} Hackathons
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {metadata?.projects || "0"} Proyectos
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {metadata?.teams || "0"} Equipos
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-2 w-full max-w-xs">
                      {form.getValues("location") && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{form.getValues("location")}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{form.getValues("email")}</span>
                      </div>
                      {form.getValues("website") && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a
                            href={form.getValues("website")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {form
                              .getValues("website")
                              ?.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                      {form.getValues("githubUrl") && (
                        <div className="flex items-center text-sm">
                          <Github className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a
                            href={form.getValues("githubUrl")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {form
                              .getValues("githubUrl")
                              ?.replace(
                                /^https?:\/\/(www\.)?github\.com\//,
                                ""
                              )}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Acerca de</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {form.getValues("bio")}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Habilidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {form.getValues("skills")?.map((skillId) => {
                          const skill = skills.find((s) => s.id === skillId);
                          return (
                            <Badge key={skillId} variant="secondary">
                              {skill?.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Actividad Reciente
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-4 rounded-lg border p-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Trophy className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Participó en el Hackathon de Sostenibilidad
                            </p>
                            <p className="text-xs text-muted-foreground">
                              hace 2 semanas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-lg border p-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Se unió al equipo &quot;Innovadores IA&quot;
                            </p>
                            <p className="text-xs text-muted-foreground">
                              hace 1 mes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
