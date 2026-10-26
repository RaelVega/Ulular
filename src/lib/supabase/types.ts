import type { OpenHoursMap, SocialLinksConfig } from "../constants";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "late_cancel"
  | "expired"
  | "no_show"
  | "completed";

export type StaffRole = "owner" | "staff";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: StaffRole;
  created_at: string;
}

export interface SettingsRow {
  id: number;
  open_hours: OpenHoursMap;
  price_per_hour: number;
  min_hours: number;
  max_days_ahead: number;
  pending_ttl_hours: number;
  cancel_notice_hours: number;
  whatsapp_number: string;
  whatsapp_channel_url: string;
  social_links: SocialLinksConfig;
  google_calendar_id: string | null;
  updated_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  time_label: string;
  venue: string;
  tag: string;
  flyer_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlackoutDateRow {
  id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
}

export interface BookingRow {
  id: string;
  code: string;
  band_name: string;
  contact_name: string | null;
  phone: string;
  starts_at: string;
  ends_at: string;
  hours: number;
  total: number;
  paid: boolean;
  status: BookingStatus;
  notes: string | null;
  admin_notes: string | null;
  google_event_id: string | null;
  source: "web" | "admin";
  created_at: string;
}
