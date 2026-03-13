import AnimatedCard from '@/components/animated/AnimatedCard';
import PageTransition from '@/components/animated/PageTransition';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Select, Switch, Tag } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

const initialDepts = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
const complaintCategories = ['PROJECTOR', 'FAN', 'LIGHT', 'SMART_BOARD', 'SEATING', 'FURNITURE', 'NETWORK', 'OTHER'];

const SystemSettings = () => {
  const [depts, setDepts] = useState(initialDepts);
  const [newDept, setNewDept] = useState('');
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const [autoCloseDays, setAutoCloseDays] = useState('14');
  const [allowedCategories, setAllowedCategories] = useState<string[]>([...complaintCategories]);

  const addDept = () => {
    if (newDept && !depts.includes(newDept)) {
      setDepts([...depts, newDept]);
      setNewDept('');
      message.success('Department added');
    }
  };

  const removeDept = (d: string) => {
    setDepts(depts.filter((x) => x !== d));
    message.info('Department removed');
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-1 sm:px-0 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>

        <AnimatedCard delay={0.1}>
          <h3 className="font-semibold text-foreground mb-4">Department Management</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <AnimatePresence>
              {depts.map((d) => (
                <motion.div key={d} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} layout>
                  <Tag closable onClose={() => removeDept(d)} className="rounded-full px-3 py-1 text-sm" color="blue">{d}</Tag>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="New department" value={newDept} onChange={(e) => setNewDept(e.target.value)} onPressEnter={addDept} className="rounded-xl" />
            <Button type="primary" icon={<PlusOutlined />} onClick={addDept} className="rounded-xl w-full sm:w-auto">Add</Button>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.15}>
          <h3 className="font-semibold text-foreground mb-4">Allowed Complaint Categories</h3>
          <Select mode="multiple" className="w-full" value={allowedCategories} onChange={(v) => setAllowedCategories(v)} options={complaintCategories.map((c) => ({ label: c.replace('_', ' '), value: c }))} />
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <h3 className="font-semibold text-foreground mb-4">Auto-Close Complaints</h3>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Switch checked={autoCloseEnabled} onChange={setAutoCloseEnabled} />
            <span className="text-foreground">Auto-resolve complaints after</span>
            <motion.div animate={{ opacity: autoCloseEnabled ? 1 : 0.4 }}>
              <Input type="number" value={autoCloseDays} onChange={(e) => setAutoCloseDays(e.target.value)} disabled={!autoCloseEnabled} className="w-20 rounded-xl" suffix="days" />
            </motion.div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <h3 className="font-semibold text-foreground mb-4">System Preferences</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-foreground">Enable email notifications</span><Switch defaultChecked /></div>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-foreground">Allow student registrations</span><Switch defaultChecked /></div>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-foreground">Maintenance mode</span><Switch /></div>
          </div>
        </AnimatedCard>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button type="primary" size="large" block className="rounded-xl h-11 font-semibold" onClick={() => message.success('Settings saved!')}>Save Settings</Button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default SystemSettings;