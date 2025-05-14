export {};

export type EventRoles = "participant" | "organizer" | "jury";
export type Roles = "admin" | "user";
export type TeamStatus = "forming" | "active" | "inactive" | "completed";

export type Event = {
  id: number;
  name: string;
  description: string;
  start_date: string; // formato 'YYYY-MM-DD'
  end_date: string; // formato 'YYYY-MM-DD'
  created_at: string; // formato ISO timestamp
};

export type Team = {
  id: number;
  created_at: string;
  name: string;
  event_id: number | null;
  leader_id: number;
  max_users: number;
  status: TeamStatus;
  description: string;
  event: Event | null;
  members?: number | Array<{ count?: number }>;
};
