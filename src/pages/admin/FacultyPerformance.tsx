/**
 * Faculty statistics for admins (CC-26).
 *
 * Oversight, not a leaderboard: sorted by name, not by any metric, so the
 * page reads as a register rather than a ranking. Opening one person's detail
 * is recorded in the audit log (CC-61).
 *
 * See campus_cure_backend/docs/specs/CC-26-faculty-stats.md.
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Drawer, Select, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Activity } from "lucide-react";
import { PageHeader, PageShell, SectionCard } from "@/components/app/PageShell";
import {
  FacultyStatsView,
  WindowPicker,
} from "@/components/facultyStats/FacultyStatsView";
import {
  type FacultyIdentity,
  type FacultyStats,
  type StatsWindow,
  formatHours,
  formatRate,
  getFacultyStatsFor,
  getFacultyStatsOverview,
} from "@/api/facultyStats";

type Row = FacultyIdentity & { stats: FacultyStats };

const DetailDrawer = ({
  facultyId,
  days,
  onClose,
}: {
  facultyId: string | null;
  days: StatsWindow;
  onClose: () => void;
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["faculty-stats", "admin", facultyId, days],
    queryFn: () => getFacultyStatsFor(facultyId!, days),
    enabled: Boolean(facultyId),
  });

  return (
    <Drawer
      open={Boolean(facultyId)}
      onClose={onClose}
      width="min(96vw, 960px)"
      title={
        data ? (
          <div>
            <div>{data.faculty.name}</div>
            <div className="text-xs font-normal text-muted-foreground">
              {data.faculty.userID} · {data.faculty.department ?? "No department"}
            </div>
          </div>
        ) : (
          "Faculty statistics"
        )
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : isError || !data ? (
        <Alert type="error" message="Could not load statistics." showIcon />
      ) : (
        <FacultyStatsView stats={data.stats} benchmark={data.benchmark} />
      )}
    </Drawer>
  );
};

const FacultyPerformance = () => {
  const [days, setDays] = useState<StatsWindow>(90);
  const [department, setDepartment] = useState<string | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);

  // The department list comes from the unfiltered overview, so the filter
  // never offers a department with nobody in it.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["faculty-stats", "overview", days],
    queryFn: () => getFacultyStatsOverview(days),
  });

  const departments = useMemo(
    () =>
      [...new Set((data?.faculty ?? []).map((f) => f.department).filter(Boolean))]
        .sort() as string[],
    [data],
  );

  const rows = useMemo(
    () =>
      (data?.faculty ?? []).filter(
        (f) => !department || f.department === department,
      ),
    [data, department],
  );

  const columns: ColumnsType<Row> = [
    {
      title: "Faculty",
      key: "name",
      render: (_, row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.department ?? "—"}
            {!row.isTeaching && (
              <Tag className="ml-2" bordered={false}>
                Non-teaching
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Answers",
      key: "answers",
      align: "right",
      render: (_, row) => row.stats.doubts.answersPosted,
    },
    {
      title: "Median response",
      key: "response",
      align: "right",
      render: (_, row) => formatHours(row.stats.doubts.responseTime.medianHours),
    },
    {
      title: "Complaints resolved",
      key: "resolved",
      align: "right",
      render: (_, row) => row.stats.complaints.resolved,
    },
    {
      title: "Median resolution",
      key: "resolution",
      align: "right",
      render: (_, row) =>
        formatHours(row.stats.complaints.resolutionTime.medianHours),
    },
    {
      title: "Within SLA",
      key: "sla",
      align: "right",
      render: (_, row) => formatRate(row.stats.complaints.sla.rate),
    },
    {
      title: "Rating",
      key: "rating",
      align: "right",
      render: (_, row) =>
        row.stats.complaints.rating.average === null
          ? "—"
          : `${row.stats.complaints.rating.average} / 5`,
    },
    {
      title: "Open now",
      key: "open",
      align: "right",
      render: (_, row) => row.stats.complaints.openNow,
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Faculty performance"
        description="Response and resolution figures for each faculty member. Visible to administrators only."
        icon={<Activity className="h-5 w-5" />}
        actions={
          <>
            <Select
              allowClear
              placeholder="All departments"
              value={department}
              onChange={setDepartment}
              options={departments.map((d) => ({ value: d, label: d }))}
              style={{ minWidth: 200 }}
            />
            <WindowPicker value={days} onChange={setDays} />
          </>
        }
      />

      <SectionCard
        description={'Sorted by name. "—" means too few items to report a figure. Opening a faculty member\'s detail is recorded in the audit log.'}
      >
        {isError ? (
          <Alert type="error" message="Could not load faculty statistics." showIcon />
        ) : (
          <Table<Row>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            scroll={{ x: 900 }}
            onRow={(row) => ({
              onClick: () => setOpenId(row.id),
              className: "cursor-pointer",
            })}
          />
        )}
      </SectionCard>

      <DetailDrawer facultyId={openId} days={days} onClose={() => setOpenId(null)} />
    </PageShell>
  );
};

export default FacultyPerformance;
