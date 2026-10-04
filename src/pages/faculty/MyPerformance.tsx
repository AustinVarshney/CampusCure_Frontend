/**
 * A faculty member's own statistics (CC-26).
 *
 * See campus_cure_backend/docs/specs/CC-26-faculty-stats.md.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Spin } from "antd";
import { Activity, Lock } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/PageShell";
import {
  FacultyStatsView,
  WindowPicker,
} from "@/components/facultyStats/FacultyStatsView";
import { type StatsWindow, getMyStats } from "@/api/facultyStats";

const MyPerformance = () => {
  const [days, setDays] = useState<StatsWindow>(90);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faculty-stats", "me", days],
    queryFn: () => getMyStats(days),
  });

  return (
    <PageShell>
      <PageHeader
        title="My performance"
        description="How quickly doubts and complaints reach you and get resolved."
        icon={<Activity className="h-5 w-5" />}
        actions={<WindowPicker value={days} onChange={setDays} />}
      />

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Only you and administrators can see these figures. They are never shown
        to students or other faculty.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : isError || !data ? (
        <Alert type="error" message="Could not load your statistics." showIcon />
      ) : (
        <FacultyStatsView stats={data.stats} benchmark={data.benchmark} />
      )}
    </PageShell>
  );
};

export default MyPerformance;
