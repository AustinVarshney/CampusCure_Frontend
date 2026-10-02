/**
 * Staff directory (CC-27).
 *
 * Open to every authenticated role, deliberately: the point is that a student
 * with a flooded bathroom can find the plumber rather than filing a complaint
 * and waiting to see where it is routed.
 *
 * Only staff who opted in appear at all. Someone who has not is absent, not
 * listed with their details hidden — listing them would still confirm they
 * work here and in which department, which is more than they agreed to share.
 * Home addresses are never returned by the API, let alone rendered.
 */
import { useEffect, useMemo, useState } from 'react';
import { Empty, Input, Segmented, Select, Tag, message } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import PageTransition from '@/components/animated/PageTransition';
import { PageHeader, PageShell } from '@/components/app/PageShell';
import { Skeleton } from '@/components/ui/skeleton';
import { getStaffDirectory, type StaffDirectoryEntry } from '@/api/staff';
import { CATEGORY_LABEL, COMPLAINT_CATEGORIES } from '@/lib/complaintCategories';

type TeachingFilter = 'all' | 'teaching' | 'support';

const StaffDirectory = () => {
  const [staff, setStaff] = useState<StaffDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [teaching, setTeaching] = useState<TeachingFilter>('all');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const rows = await getStaffDirectory({
          ...(category ? { category } : {}),
          ...(teaching === 'all' ? {} : { teaching: teaching === 'teaching' }),
        });
        // Guards against an earlier, slower request landing after a later one
        // and repainting the list with stale filters.
        if (!cancelled) setStaff(rows);
      } catch {
        if (!cancelled) message.error('Could not load the staff directory.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [category, teaching]);

  // Name search is local: the list is one institution's opted-in staff, so it
  // is small, and filtering here keeps typing instant instead of one request
  // per keystroke.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (person) =>
        person.name.toLowerCase().includes(q) ||
        (person.staffRole ?? '').toLowerCase().includes(q) ||
        person.department.toLowerCase().includes(q),
    );
  }, [staff, query]);

  return (
    <PageTransition>
      <PageShell>
        <PageHeader
          title="Staff directory"
          description="Teaching and support staff who have chosen to be listed."
          icon={<TeamOutlined />}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            allowClear
            placeholder="Search by name, role or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />

          <Select
            allowClear
            placeholder="Handles…"
            className="sm:w-56"
            value={category}
            onChange={setCategory}
            options={COMPLAINT_CATEGORIES.map((c) => ({
              label: CATEGORY_LABEL[c],
              value: c,
            }))}
          />

          <Segmented
            value={teaching}
            onChange={(v) => setTeaching(v as TeachingFilter)}
            options={[
              { label: 'Everyone', value: 'all' },
              { label: 'Teaching', value: 'teaching' },
              { label: 'Support', value: 'support' },
            ]}
          />
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <Empty
            description={
              staff.length === 0
                ? 'No staff have listed themselves yet. Staff can opt in from their profile.'
                : 'Nobody matches that search.'
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((person) => (
              <div
                key={person.id}
                className="rounded-xl border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {person.staffRole ?? (person.isTeaching ? 'Teaching staff' : 'Support staff')}
                      {' · '}
                      {person.department}
                    </p>
                  </div>
                  <Tag color={person.isTeaching ? 'blue' : 'green'}>
                    {person.isTeaching ? 'Teaching' : 'Support'}
                  </Tag>
                </div>

                {person.handlesCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {person.handlesCategories.map((c) => (
                      <Tag key={c} className="text-[11px]">
                        {CATEGORY_LABEL[c] ?? c}
                      </Tag>
                    ))}
                  </div>
                )}

                <div className="space-y-0.5 text-xs">
                  <a
                    href={`mailto:${person.email}`}
                    className="block truncate text-primary hover:underline"
                  >
                    {person.email}
                  </a>
                  {/* Absent rather than blank when unset: the API returns null
                      for the "Not Set" placeholder registration writes. */}
                  {person.phoneNumber && (
                    <a
                      href={`tel:${person.phoneNumber}`}
                      className="block text-muted-foreground hover:underline"
                    >
                      {person.phoneNumber}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageShell>
    </PageTransition>
  );
};

export default StaffDirectory;
