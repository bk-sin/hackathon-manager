"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  Calendar,
  Filter,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard-header";
import { formatEventDateRange } from "@/lib/utils";
import { TeamStatus } from "@/types/globals";

export interface Team {
  id: number;
  created_at: string;
  name: string;
  event_id: number | null;
  leader_id: number;
  max_users: number;
  status: TeamStatus;
  description: string;
  event: Event | null;
  members: number;
  isLeader?: boolean;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  start_date: string; // formato 'YYYY-MM-DD'
  end_date: string; // formato 'YYYY-MM-DD'
  created_at: string; // formato ISO timestamp
}

export default function TeamsPageClient({
  teams,
  events,
  availableTeams,
}: {
  teams: Team[];
  events: Event[];
  availableTeams: Team[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("my-teams");

  // Estado para el formulario de nuevo equipo
  const [newTeam, setNewTeam] = useState<{
    name: string;
    description: string;
    event: number | null;
    max_users: number;
  }>({
    name: "",
    description: "",
    event: null,
    max_users: 4,
  });

  // Filtrar equipos según búsqueda y filtros
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.event?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && team.status === statusFilter;
  });

  // Ordenar equipos
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    if (sortOrder === "newest") {
      // Simulamos ordenar por fecha (en datos reales usaríamos timestamps)
      return -1;
    } else if (sortOrder === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === "members") {
      return b.members - a.members;
    }
    return 0;
  });

  // Manejar la creación de un nuevo equipo
  const handleCreateTeam = async () => {
    setIsCreating(true);

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTeam.name,
          description: newTeam.description,
          event_id: newTeam.event ? Number(newTeam.event) : null,
          max_users: Number(newTeam.max_users),
          status: "forming", // o el estado inicial que prefieras
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear el equipo");
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Error al crear el equipo");
      }
    } finally {
      setIsCreating(false);
      setCreateDialogOpen(false);
    }
  };

  // Renderizar el estado del equipo
  const renderTeamStatus = (status: TeamStatus) => {
    switch (status) {
      case "active":
        return <Badge>Activo</Badge>;
      case "forming":
        return <Badge variant="outline">Formándose</Badge>;
      case "completed":
        return <Badge variant="secondary">Completado</Badge>;
      default:
        return null;
    }
  };

  const handleRequestJoin = async (teamId: number) => {
    try {
      const res = await fetch("/api/teams/request-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al solicitar unirse");
      }
      alert("Solicitud enviada al líder del equipo.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al solicitar unirse");
    }
  };

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  console.log(pendingRequests);
  useEffect(() => {
    fetch("/api/teams/pending-request")
      .then((res) => res.json())
      .then((data) => setPendingRequests(data.requests || []));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Equipos</h2>
            <p className="text-muted-foreground">
              Gestiona tus equipos para hackathons y colabora con otros
              desarrolladores
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Equipo</DialogTitle>
                <DialogDescription>
                  Crea un nuevo equipo para participar en un hackathon. Podrás
                  invitar miembros después.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="team-name" className="text-sm font-medium">
                    Nombre del Equipo
                  </label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, name: e.target.value })
                    }
                    placeholder="Nombre de tu equipo"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="team-description"
                    className="text-sm font-medium"
                  >
                    Descripción
                  </label>
                  <Textarea
                    id="team-description"
                    value={newTeam.description}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, description: e.target.value })
                    }
                    placeholder="Describe brevemente a tu equipo, sus objetivos y fortalezas"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="team-hackathon"
                    className="text-sm font-medium"
                  >
                    Hackathon
                  </label>
                  <Select
                    value={
                      newTeam.event !== null ? String(newTeam.event) : undefined
                    }
                    onValueChange={(value) =>
                      setNewTeam({
                        ...newTeam,
                        event: value ? Number(value) : null,
                      })
                    }
                  >
                    <SelectTrigger id="team-hackathon">
                      <SelectValue placeholder="Selecciona un hackathon" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name} (
                          {formatEventDateRange(
                            event.start_date,
                            event.end_date
                          )}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="team-max-members"
                    className="text-sm font-medium"
                  >
                    Máximo de Miembros
                  </label>
                  <Select
                    value={newTeam.max_users.toString()}
                    onValueChange={(value) =>
                      setNewTeam({ ...newTeam, max_users: Number(value) })
                    }
                  >
                    <SelectTrigger id="team-max-members">
                      <SelectValue placeholder="Selecciona el máximo de miembros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 miembros</SelectItem>
                      <SelectItem value="3">3 miembros</SelectItem>
                      <SelectItem value="4">4 miembros</SelectItem>
                      <SelectItem value="5">5 miembros</SelectItem>
                      <SelectItem value="6">6 miembros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeam.name || !newTeam.event || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Equipo"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs
          defaultValue="my-teams"
          className="space-y-4"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="my-teams">Mis Equipos</TabsTrigger>
            <TabsTrigger value="invitations">Invitaciones</TabsTrigger>
            <TabsTrigger value="explore">Explorar Equipos</TabsTrigger>
            <TabsTrigger value="requests">Solicitues a tus equipos</TabsTrigger>
          </TabsList>

          <TabsContent value="my-teams" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filtrar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Estado</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Activos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("forming")}
                    >
                      Formándose
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("completed")}
                    >
                      Completados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setSortOrder("newest")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Más recientes
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                      Más recientes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOrder("alphabetical")}
                    >
                      Alfabético
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOrder("members")}>
                      Número de miembros
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {sortedTeams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedTeams.map((team) => (
                  <Card key={team.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-base">
                              {team.name}
                            </CardTitle>
                            <CardDescription>
                              {team.event?.name}
                            </CardDescription>
                          </div>
                        </div>
                        {renderTeamStatus(team.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {team.description}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {team.event?.start_date} a {team.event?.end_date}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {team.members}/{team.max_users} miembros
                          </span>
                        </div>
                        {team.isLeader && (
                          <Badge variant="outline" className="text-xs">
                            Eres líder de este equipo
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </Button>
                      {/* <div className="flex gap-2">
                        {team.status !== "completed" &&
                          team.members < team.maxMembers && (
                            <Button size="sm" className="gap-1">
                              <UserPlus className="h-3.5 w-3.5" />
                              Invitar
                            </Button>
                          )}
                        <Link href={`/teams/${team.id}`}>
                          <Button size="sm">Ver Equipo</Button>
                        </Link>
                      </div> */}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  No se encontraron equipos
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "No hay equipos que coincidan con tu búsqueda. Intenta con otros filtros."
                    : "Aún no tienes equipos. Crea tu primer equipo para participar en un hackathon."}
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Crear Primer Equipo
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invitaciones a Equipos</CardTitle>
                <CardDescription>
                  Invitaciones pendientes para unirte a equipos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No tienes invitaciones pendientes
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Cuando alguien te invite a un equipo, aparecerá aquí.
                    También puedes explorar equipos que buscan miembros.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("explore")}
                  >
                    Explorar Equipos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Explorar Equipos</CardTitle>
                <CardDescription>
                  Encuentra equipos que buscan miembros para hackathons
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableTeams.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableTeams.map((team) => (
                      <Card key={team.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div>
                                <CardTitle className="text-base">
                                  {team.name}
                                </CardTitle>
                                <CardDescription>
                                  {team.event?.name}
                                </CardDescription>
                              </div>
                            </div>
                            {/* Puedes mostrar el estado si lo deseas */}
                            {renderTeamStatus && renderTeamStatus(team.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {team.description}
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {team.event?.start_date} a{" "}
                                {team.event?.end_date}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {team.members}/{team.max_users} miembros
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleRequestJoin(team.id)}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Solicitar Unirse
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No hay equipos disponibles
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                      Actualmente no hay equipos buscando miembros. ¡Crea uno
                      nuevo o vuelve a intentarlo más tarde!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes a tus equipos</CardTitle>
                <CardDescription>
                  Usuarios que han solicitado unirse a tus equipos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <div key={req.id} className="mb-4">
                      <div>
                        <b>{req.users?.name || req.users?.clerk_id}</b> solicita
                        unirse al equipo #{req.team_id}
                      </div>
                      {/* Aquí puedes poner botones para aceptar/declinar */}
                    </div>
                  ))
                ) : (
                  <div>No hay solicitudes pendientes.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
