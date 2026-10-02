/**
 * Faculty performance statistics (CC-26).
 *
 * Private to the faculty member and to admins. See
 * campus_cure_backend/docs/specs/CC-26-faculty-stats.md.
 */

import { api } from "./auth";

export type StatsWindow = 30 | 90 | 365;
export const STATS_WINDOWS: StatsWindow[] = [30, 90, 365];

export interface Timing {
  /** Null when the sample is too small to report. */
  medianHours: number | null;
  p90Hours?: number | null;
  sampleSize: number;
}

export interface FacultyStats {
  userId: string;
  doubts: {
    answersPosted: number;
    doubtsAnswered: number;
    acceptedAnswers: number;
    upvotesReceived: number;
    responseTime: Timing;
  };
  moderation: {
    answersReviewed: number;
    reviewTime: Timing;
    draftsReviewed: number;
    draftsApproved: number;
    draftsEditedOnApproval: number;
  };
  complaints: {
    assigned: number;
    resolved: number;
    openNow: number;
    escalated: number;
    resolutionTime: Timing;
    sla: { tracked: number; met: number; rate: number | null };
    rating: { average: number | null; count: number };
  };
}

/** Null when the department is too small to publish without identifying people. */
export interface DepartmentBenchmark {
  department: string;
  facultyCount: number;
  responseTimeMedianHours: number | null;
  resolutionTimeMedianHours: number | null;
  slaRate: number | null;
  averageRating: number | null;
}

export interface FacultyIdentity {
  id: string;
  name: string;
  userID: string;
  department: string | null;
  isTeaching: boolean;
}

export const getMyStats = async (days: StatsWindow) => {
  const { data } = await api.get<{
    days: StatsWindow;
    stats: FacultyStats;
    benchmark: DepartmentBenchmark | null;
  }>("/faculty/me/stats", { params: { days } });
  return data;
};

export const getFacultyStatsOverview = async (
  days: StatsWindow,
  department?: string,
) => {
  const { data } = await api.get<{
    days: StatsWindow;
    faculty: Array<FacultyIdentity & { stats: FacultyStats }>;
  }>("/admin/faculty/stats", {
    params: { days, ...(department ? { department } : {}) },
  });
  return data;
};

/** Audited on the server: opening one person's record is logged. */
export const getFacultyStatsFor = async (id: string, days: StatsWindow) => {
  const { data } = await api.get<{
    days: StatsWindow;
    faculty: FacultyIdentity;
    stats: FacultyStats;
    benchmark: DepartmentBenchmark | null;
  }>(`/admin/faculty/${id}/stats`, { params: { days } });
  return data;
};

/** "45 min", "6.5 h", "3.2 days", or a dash when withheld. */
export const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours * 10) / 10} h`;
  return `${Math.round((hours / 24) * 10) / 10} days`;
};

export const formatRate = (rate: number | null | undefined): string =>
  rate === null || rate === undefined ? "—" : `${Math.round(rate * 100)}%`;
