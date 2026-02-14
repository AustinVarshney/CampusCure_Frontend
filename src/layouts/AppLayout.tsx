import { useState } from 'react';
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Badge, Input } from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, FormOutlined,
  UnorderedListOutlined, QuestionCircleOutlined, BellOutlined, UserOutlined,
  LogoutOutlined, SettingOutlined, TeamOutlined, BarChartOutlined,
  SafetyCertificateOutlined, SearchOutlined, MenuOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { notifications } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const { Header, Sider, Content } = Layout;

type MenuItem = { key: string; icon: React.ReactNode; label: string };

const menuByRole: Record<string, MenuItem[]> = {
  STUDENT: [
    { key: '/student/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/student/complaints/new', icon: <FormOutlined />, label: 'Raise Complaint' },
    { key: '/student/complaints', icon: <UnorderedListOutlined />, label: 'My Complaints' },
    { key: '/student/doubts', icon: <QuestionCircleOutlined />, label: 'Doubt Community' },
  ],
  FACULTY: [
    { key: '/faculty/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/faculty/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/faculty/doubts', icon: <QuestionCircleOutlined />, label: 'Doubts' },
  ],
  ADMIN: [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
  ],
  SUPER_ADMIN: [
    { key: '/superadmin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/superadmin/admins', icon: <SafetyCertificateOutlined />, label: 'Admin Management' },
    { key: '/superadmin/settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: '/admin/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
  ],
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!user) return null;

  const menuItems = menuByRole[user.role];

  const profileMenu = {
    items: [
      { key: 'profile', label: user.name, disabled: true },
      { key: 'role', label: `Role: ${user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`, disabled: true },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    onClick: async ({ key }: { key: string }) => {
      if (key === 'logout') {
        await logout();
        navigate('/login');
      }
    },
  };

  const notifMenu = {
    items: notifications.map((n) => ({
      key: n.id,
      label: (
        <div className="max-w-[280px]">
          <div className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.message}</div>
          <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
        </div>
      ),
    })),
  };

  const siderContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <motion.div
          animate={{ opacity: 1 }}
          className="text-lg font-bold"
          style={{ color: 'hsl(214 100% 50%)' }}
        >
          {collapsed && !isMobile ? '🎓' : '🎓 CampusCure'}
        </motion.div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) setMobileDrawer(false);
        }}
        style={{ border: 'none', background: 'transparent' }}
      />
    </div>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout className="h-full">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          collapsedWidth={80}
          style={{ background: 'hsl(var(--sidebar-background))', borderRight: '1px solid hsl(var(--border))' }}
        >
          {siderContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawer}
          onClose={() => setMobileDrawer(false)}
          width={260}
          styles={{ body: { padding: 0, background: 'hsl(var(--sidebar-background))' } }}
        >
          {siderContent}
        </Drawer>
      )}

      <Layout>
        <Header
          className="flex items-center justify-between px-4 md:px-6"
          style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))', height: 64, lineHeight: '64px', padding: '0 16px' }}
        >
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileDrawer(true)} />
            ) : (
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
            )}
            <Input
              prefix={<SearchOutlined className="text-muted-foreground" />}
              placeholder="Search..."
              className="max-w-[240px] hidden md:block"
              variant="filled"
            />
          </div>

          <div className="flex items-center gap-2">
            <Dropdown menu={notifMenu} trigger={['click']} placement="bottomRight">
              <Badge count={unreadCount} size="small">
                <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
              </Badge>
            </Dropdown>
            <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-accent transition">
                <Avatar style={{ backgroundColor: 'hsl(214 100% 50%)' }} icon={<UserOutlined />} />
                <span className="hidden md:inline text-sm font-medium text-foreground">{user.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-4 md:p-6 overflow-auto" style={{ background: 'hsl(var(--muted))' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
