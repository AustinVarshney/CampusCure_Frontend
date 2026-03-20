import AnimatedCard from '@/components/animated/AnimatedCard';
import PageTransition from '@/components/animated/PageTransition';
import { getSuperAdminSettings, updateSuperAdminSettings } from '@/api/admin';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Select, Spin, Tag } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const initialDepts = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
const complaintCategories = ['PROJECTOR', 'FAN', 'LIGHT', 'SMART_BOARD', 'SEATING', 'FURNITURE', 'NETWORK', 'OTHER'];
const defaultDoubtSubjects = ['DSA', 'DBMS', 'OS', 'NETWORKS'];

const SystemSettings = () => {
  const [depts, setDepts] = useState<string[]>(initialDepts);
  const [newDept, setNewDept] = useState('');
  const [allowedCategories, setAllowedCategories] = useState<string[]>([...complaintCategories]);
  const [doubtSubjects, setDoubtSubjects] = useState<string[]>([...defaultDoubtSubjects]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialSettings, setInitialSettings] = useState<{
    departments: string[];
    allowedCategories: string[];
    doubtSubjects: string[];
  } | null>(null);

  useEffect(() => {
    let active = true;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await getSuperAdminSettings();
        if (!active) {
          return;
        }

        setDepts(settings.departments.length > 0 ? settings.departments : initialDepts);
        setAllowedCategories(
          settings.allowedCategories.length > 0
            ? settings.allowedCategories
            : complaintCategories,
        );
        setDoubtSubjects(
          settings.doubtSubjects.length > 0
            ? settings.doubtSubjects
            : defaultDoubtSubjects,
        );
        setInitialSettings({
          departments:
            settings.departments.length > 0 ? settings.departments : initialDepts,
          allowedCategories:
            settings.allowedCategories.length > 0
              ? settings.allowedCategories
              : complaintCategories,
          doubtSubjects:
            settings.doubtSubjects.length > 0
              ? settings.doubtSubjects
              : defaultDoubtSubjects,
        });
      } catch (err) {
        if (active) {
          message.error(err instanceof Error ? err.message : 'Failed to load settings');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchSettings();

    return () => {
      active = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set([...complaintCategories, ...allowedCategories])).map((category) => ({
        label: category.replace(/_/g, ' '),
        value: category,
      })),
    [allowedCategories],
  );

  const doubtSubjectOptions = useMemo(
    () =>
      Array.from(new Set([...defaultDoubtSubjects, ...doubtSubjects])).map((subject) => ({
        label: subject,
        value: subject,
      })),
    [doubtSubjects],
  );

  const isDirty = useMemo(() => {
    if (!initialSettings) {
      return false;
    }

    const normalize = (values: string[]) =>
      [...new Set(values.map((value) => value.trim()).filter(Boolean))]
        .map((value) => value.toUpperCase())
        .sort()
        .join('|');

    return (
      normalize(depts) !== normalize(initialSettings.departments) ||
      normalize(allowedCategories) !== normalize(initialSettings.allowedCategories) ||
      normalize(doubtSubjects) !== normalize(initialSettings.doubtSubjects)
    );
  }, [allowedCategories, depts, doubtSubjects, initialSettings]);

  const addDept = () => {
    const trimmedDept = newDept.trim();

    if (!trimmedDept) {
      return;
    }

    if (depts.some((dept) => dept.toLowerCase() === trimmedDept.toLowerCase())) {
      message.warning('Department already exists');
      return;
    }

    setDepts([...depts, trimmedDept]);
    setNewDept('');
    message.success('Department added');
  };

  const removeDept = (d: string) => {
    if (depts.length <= 1) {
      message.warning('At least one department is required');
      return;
    }

    setDepts(depts.filter((x) => x !== d));
    message.info('Department removed');
  };

  const saveSettings = async () => {
    if (depts.length === 0) {
      message.error('At least one department is required');
      return;
    }

    if (allowedCategories.length === 0) {
      message.error('Select at least one complaint category');
      return;
    }

    if (doubtSubjects.length === 0) {
      message.error('Select at least one doubt subject');
      return;
    }

    try {
      setSaving(true);
      const updatedSettings = await updateSuperAdminSettings({
        departments: depts,
        allowedCategories,
        doubtSubjects,
      });

      setDepts(updatedSettings.departments);
      setAllowedCategories(updatedSettings.allowedCategories);
      setDoubtSubjects(updatedSettings.doubtSubjects);
      setInitialSettings({
        departments: updatedSettings.departments,
        allowedCategories: updatedSettings.allowedCategories,
        doubtSubjects: updatedSettings.doubtSubjects,
      });
      message.success('Settings saved successfully');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="h-[50vh] flex items-center justify-center">
          <Spin size="large" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-1 sm:px-0 space-y-6">
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage departments, complaint categories, and doubt subjects available to users.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tag color="blue" className="rounded-full px-3 py-1">{depts.length} departments</Tag>
              <Tag color="geekblue" className="rounded-full px-3 py-1">{allowedCategories.length} complaint types</Tag>
              <Tag color="purple" className="rounded-full px-3 py-1">{doubtSubjects.length} doubt subjects</Tag>
            </div>
          </div>
        </div>

        <AnimatedCard delay={0.1}>
          <h3 className="font-semibold text-foreground">Department Management</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Departments are used for user profile assignment and admin filtering.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <AnimatePresence>
              {depts.map((d) => (
                <motion.div key={d} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} layout>
                  <Tag closable={!saving} onClose={() => removeDept(d)} className="rounded-full px-3 py-1 text-sm" color="blue">{d}</Tag>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="New department" value={newDept} onChange={(e) => setNewDept(e.target.value)} onPressEnter={addDept} className="rounded-xl" disabled={saving} />
            <Button type="primary" icon={<PlusOutlined />} onClick={addDept} className="rounded-xl w-full sm:w-auto" disabled={saving}>Add</Button>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.15}>
          <h3 className="font-semibold text-foreground">Allowed Complaint Categories</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Students can only choose categories listed here while raising complaints.
          </p>
          <Select
            mode="tags"
            className="w-full"
            value={allowedCategories}
            onChange={(v) => setAllowedCategories(v.map((item) => item.trim()).filter(Boolean))}
            options={categoryOptions}
            disabled={saving}
            tokenSeparators={[',']}
            placeholder="Select or type categories"
            maxTagCount="responsive"
          />
        </AnimatedCard>

        <AnimatedCard delay={0.18}>
          <h3 className="font-semibold text-foreground">Allowed Doubt Subjects</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Students can only choose subjects listed here while posting doubts.
          </p>
          <Select
            mode="tags"
            className="w-full"
            value={doubtSubjects}
            onChange={(v) => setDoubtSubjects(v.map((item) => item.trim()).filter(Boolean))}
            options={doubtSubjectOptions}
            disabled={saving}
            tokenSeparators={[',']}
            placeholder="Select or type subjects"
            maxTagCount="responsive"
          />
        </AnimatedCard>

        <div className="sticky bottom-3 z-10">
          <motion.div whileTap={{ scale: 0.99 }} className="rounded-2xl border bg-card/95 backdrop-blur px-4 py-3 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {isDirty ? 'You have unsaved changes.' : 'All changes are saved.'}
              </p>
              <Button
                type="primary"
                size="large"
                className="rounded-xl h-11 font-semibold min-w-40"
                onClick={saveSettings}
                loading={saving}
                disabled={!isDirty || saving}
              >
                Save Settings
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SystemSettings;