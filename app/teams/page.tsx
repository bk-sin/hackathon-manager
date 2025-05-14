import { cookies } from "next/headers";
import TeamsPageClient from "./page-client";
import axios from "axios";

export default async function TeamsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";

  // Obtén las cookies del request original
  const cookieHeader = cookies().toString();

  const { data } = await axios.get(`${baseUrl}/api/teams/my`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  const { data: eventsData } = await axios.get(`${baseUrl}/api/events`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
  const events = eventsData.events || [];

  const teams = data.teams || [];

  // Equipos disponibles para unirse
  const { data: availableTeamsData } = await axios.get(
    `${baseUrl}/api/teams/available`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    }
  );
  const availableTeams = availableTeamsData.teams || [];

  console.log(availableTeams);

  return (
    <TeamsPageClient
      teams={teams}
      events={events}
      availableTeams={availableTeams}
    />
  );
}
