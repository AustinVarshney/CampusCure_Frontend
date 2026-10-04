/**
 * One faculty member's statistics (CC-26).
 *
 * Shared by the faculty member's own page and the admin drawer, so both see
 * the same numbers presented the same way. Deliberately no rank and no
 * comparison with named colleagues - only the department median, and only
 * when the server judged the department large enough to publish one.
 */

import { Segmented, Tooltip } from "antd";
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Inbox,
  MessageSquare,
  ShieldCheck,
  Star,
  ThumbsUp,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { SectionCard, StatCard, StatGrid } from "@/components/app/PageShell";
import {
  type DepartmentBenchmark,
  type FacultyStats,
  STATS_WINDOWS,
  type StatsWindow,
  type Timing,
  formatHours,
  formatRate,
} from "@/api/facultyStats";

/** "median of 12" or the reason a figure is withheld. */
const sampleHint = (timing: Timing, unit: string): string =>
  timing.medianHours === null
    ? timing.sampleSize === 0
      ? `No ${unit} yet`
      : `Only ${timing.sampleSize} ${unit} - too few to report`
    : `Median of ${timing.sampleSize} ${unit}`;

const versus = (label: string | null) =>
  label ? <div className="mt-0.5">Department median: {label}</div> : null;

export const WindowPicker = ({
  value,
  onChange,
}: {
  value: StatsWindow;
  onChange: (days: StatsWindow) => void;
}) => (
  <Segmented
    value={value}
    onChange={(next) => onChange(next as StatsWindow)}
    options={STATS_WINDOWS.map((days) => ({
      value: days,
      label: days === 365 ? "12 months" : `${days} days`,
    }))}
  />
);

export const FacultyStatsView = ({
  stats,
  benchmark,
}: {
  stats: FacultyStats;
  benchmark: DepartmentBenchmark | null;
}) => {
  const { doubts, moderation, complaints } = stats;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Doubts"
        description="Response time runs from when a doubt was posted to your first answer on it."
      >
        <StatGrid cols={4}>
          <StatCard
            index={0}
            icon={<Timer className="h-4 w-4" />}
            label="Median response time"
            value={formatHours(doubts.responseTime.medianHours)}
            hint={
              <>
                {sampleHint(doubts.responseTime, "doubts")}
                {doubts.responseTime.p90Hours != null && (
                  <Tooltip title="9 in 10 of your first answers came faster than this.">
                    <div className="mt-0.5 cursor-help">
                      Slowest 10%: over {formatHours(doubts.responseTime.p90Hours)}
                    </div>
                  </Tooltip>
                )}
                {versus(
                  benchmark?.responseTimeMedianHours != null
                    ? formatHours(benchmark.responseTimeMedianHours)
                    : null,
                )}
              </>
            }
          />
          <StatCard
            index={1}
            icon={<MessageSquare className="h-4 w-4" />}
            label="Answers posted"
            value={doubts.answersPosted}
            hint={`Across ${doubts.doubtsAnswered} doubts`}
          />
          <StatCard
            index={2}
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Accepted by the student"
            value={doubts.acceptedAnswers}
          />
          <StatCard
            index={3}
            icon={<ThumbsUp className="h-4 w-4" />}
            label="Upvotes received"
            value={doubts.upvotesReceived}
          />
        </StatGrid>
      </SectionCard>

      <SectionCard
        title="Moderation"
        description="Student answers you approved or rejected, and AI drafts you reviewed."
      >
        <StatGrid cols={4}>
          <StatCard
            index={0}
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Student answers reviewed"
            value={moderation.answersReviewed}
          />
          <StatCard
            index={1}
            icon={<Clock className="h-4 w-4" />}
            label="Median time to review"
            value={formatHours(moderation.reviewTime.medianHours)}
            hint={sampleHint(moderation.reviewTime, "reviews")}
          />
          <StatCard
            index={2}
            icon={<BookOpenCheck className="h-4 w-4" />}
            label="AI drafts reviewed"
            value={moderation.draftsReviewed}
          />
          <StatCard
            index={3}
            icon={<FileCheck2 className="h-4 w-4" />}
            label="AI drafts approved"
            value={moderation.draftsApproved}
            hint={
              moderation.draftsApproved > 0
                ? `${moderation.draftsEditedOnApproval} edited before approval`
                : undefined
            }
          />
        </StatGrid>
      </SectionCard>

      <SectionCard
        title="Complaints"
        description="Resolution time runs from assignment to when you marked it resolved; student confirmation is not counted against you."
      >
        <StatGrid cols={4}>
          <StatCard
            index={0}
            icon={<Timer className="h-4 w-4" />}
            label="Median resolution time"
            value={formatHours(complaints.resolutionTime.medianHours)}
            hint={
              <>
                {sampleHint(complaints.resolutionTime, "complaints")}
                {versus(
                  benchmark?.resolutionTimeMedianHours != null
                    ? formatHours(benchmark.resolutionTimeMedianHours)
                    : null,
                )}
              </>
            }
          />
          <StatCard
            index={1}
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Resolved within SLA"
            value={formatRate(complaints.sla.rate)}
            hint={
              <>
                {complaints.sla.tracked > 0
                  ? `${complaints.sla.met} of ${complaints.sla.tracked} with a deadline`
                  : "No deadlines tracked yet"}
                {versus(
                  benchmark?.slaRate != null ? formatRate(benchmark.slaRate) : null,
                )}
              </>
            }
          />
          <StatCard
            index={2}
            icon={<Star className="h-4 w-4" />}
            label="Average student rating"
            value={
              complaints.rating.average === null
                ? "—"
                : `${complaints.rating.average} / 5`
            }
            hint={
              <>
                {complaints.rating.average === null && complaints.rating.count > 0
                  ? `Only ${complaints.rating.count} ratings - too few to report`
                  : `${complaints.rating.count} ratings`}
                {versus(
                  benchmark?.averageRating != null
                    ? `${benchmark.averageRating} / 5`
                    : null,
                )}
              </>
            }
          />
          <StatCard
            index={3}
            icon={<Inbox className="h-4 w-4" />}
            label="Open right now"
            value={complaints.openNow}
            hint={`${complaints.assigned} assigned, ${complaints.resolved} resolved in this period`}
          />
        </StatGrid>

        {complaints.escalated > 0 && (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
            {complaints.escalated} complaint
            {complaints.escalated === 1 ? " was" : "s were"} escalated after
            assignment in this period.
          </p>
        )}
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        {benchmark
          ? `Department figures are medians across the ${benchmark.facultyCount} faculty in ${benchmark.department}.`
          : "No department comparison is shown: the department is too small to show one without identifying individual colleagues."}{" "}
        Figures based on fewer than three items are not shown.
      </p>
    </div>
  );
};

export default FacultyStatsView;
