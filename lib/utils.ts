import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEventDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.getDate().toString().padStart(2, "0");
  const endDay = endDate.getDate().toString().padStart(2, "0");

  const month = endDate.toLocaleString("es-ES", { month: "long" });
  const year = endDate.getFullYear();

  return `${startDay}-${endDay} ${capitalize(month)}, ${year}`;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
