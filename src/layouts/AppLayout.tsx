import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAdminLevel } from '@/lib/authUtils';
import { UserRole } from '@/types';
import {
  BarChartOutlined,
  BellOutlined,
  DashboardOutlined, FormOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined, SearchOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Dropdown, Input, Layout, Menu } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

type MenuItem = { key: string; icon: React.ReactNode; label: string };

const getMenuItems = (role: UserRole, userId: string): MenuItem[] => {
  if (role === 'STUDENT') return [
    { key: '/student/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/student/complaints/new', icon: <FormOutlined />, label: 'Raise Complaint' },
    { key: '/student/complaints', icon: <UnorderedListOutlined />, label: 'My Complaints' },
    { key: '/student/doubts', icon: <QuestionCircleOutlined />, label: 'Doubt Community' },
  ];
  if (role === 'FACULTY') return [
    { key: '/faculty/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/faculty/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/faculty/doubts', icon: <QuestionCircleOutlined />, label: 'Doubts' },
  ];
  // ADMIN
  const level = getAdminLevel(userId);
  const base: MenuItem[] = [
    { key: level === 'SUPER' ? '/superadmin/dashboard' : '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
  ];
  if (level === 'SUPER') {
    base.push(
      { key: '/superadmin/admins', icon: <SafetyCertificateOutlined />, label: 'Admin Management' },
      { key: '/superadmin/settings', icon: <SettingOutlined />, label: 'Settings' },
    );
  }
  return base;
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!user) return null;

  const menuItems = getMenuItems(user.role, user.id);

  const profilePath = user.role === 'STUDENT' ? '/student/profile' : user.role === 'FACULTY' ? '/faculty/profile' : user.role === 'ADMIN' ? '/admin/profile' : null;

  const profileMenu = {
    items: [
      { key: 'profile', label: user.name, disabled: true },
      { key: 'role', label: `Role: ${user.role}`, disabled: true },
      { type: 'divider' as const },
      ...(profilePath ? [{ key: 'view-profile', icon: <UserOutlined />, label: 'My Profile' }] : []),
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        logout();
      }
      if (key === 'view-profile' && profilePath) {
        navigate(profilePath);
      }
    },
  };

  const notifMenu = {
    items: [
      {
        key: 'no-notifications',
        label: (
          <div className="max-w-[280px] text-center text-muted-foreground p-2">
            No new notifications
          </div>
        ),
      },
    ],
  };

  const siderContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-16 border-b ">
        <motion.div animate={{ opacity: 1 }} className="text-lg font-bold" style={{ color: 'hsl(214 100% 50%)' }}>
          {collapsed && !isMobile ? '🎓' : '🎓 CampusCure'}
        </motion.div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => { navigate(key); if (isMobile) setMobileDrawer(false); }}
        style={{ border: 'none', background: 'transparent' }}
      />
    </div>
  );

  const unreadCount = 0; // This will be fetched from the backend

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed} width={240} collapsedWidth={80} style={{ background: 'hsl(var(--sidebar-background))', borderRight: '1px solid hsl(var(--border))' }}>
          {siderContent}
        </Sider>
      )}
      {isMobile && (
        <Drawer placement="left" open={mobileDrawer} onClose={() => setMobileDrawer(false)} width={260} styles={{ body: { padding: 0, background: 'hsl(var(--sidebar-background))' } }}>
          {siderContent}
        </Drawer>
      )}
      <Layout>
        <Header className="flex items-center justify-between px-4 md:px-6" style={{ background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))', height: 64, lineHeight: '64px', padding: '0 16px' }}>
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileDrawer(true)} />
            ) : (
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
            )}
            <Input prefix={<SearchOutlined className="text-muted-foreground" />} placeholder="Search..." className="max-w-[240px] hidden md:block" variant="filled" />
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
              <Button type="text" icon={darkMode ? <SunOutlined style={{ fontSize: 18, color: '#faad14' }} /> : <MoonOutlined style={{ fontSize: 18 }} />} onClick={() => setDarkMode(!darkMode)} />
            </motion.div>
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
        <Content className="p-4 md:p-6 overflow-auto" style={{ background: 'hsl(var(--background))' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;