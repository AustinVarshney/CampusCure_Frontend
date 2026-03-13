import { getNotificationRoute, getNotifications, getUnreadCount, markAllAsRead, markAsRead, type Notification } from '@/api/notifications';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { Avatar, Badge, Button, Drawer, Dropdown, Input, Layout, Menu, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = { key: string; icon: React.ReactNode; label: string };

const getMenuItems = (role: UserRole): MenuItem[] => {
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
  // SUPER_ADMIN
  if (role === 'SUPER_ADMIN') return [
    { key: '/superadmin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
    { key: '/superadmin/admins', icon: <SafetyCertificateOutlined />, label: 'Admin Management' },
    { key: '/superadmin/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];
  // ADMIN (NORMAL)
  return [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/complaints', icon: <UnorderedListOutlined />, label: 'Complaints' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
  ];
};

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();

  const loadNotifications = async () => {
    try {
      console.log('Frontend: Loading notifications...');
      const response = await getNotifications(10);
      console.log('Frontend: Notification response:', response);
      if (response.success) {
        console.log('Frontend: Setting notifications:', response.notifications);
        setNotifications(response.notifications);
      } else {
        console.error('Frontend: API returned success=false');
      }
    } catch (error) {
      console.error('Frontend: Failed to load notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      console.log('Frontend: Loading unread count...');
      const response = await getUnreadCount();
      console.log('Frontend: Unread count response:', response);
      if (response.success) {
        console.log('Frontend: Setting unread count:', response.count);
        setUnreadCount(response.count);
      } else {
        console.error('Frontend: Unread count API returned success=false');
      }
    } catch (error) {
      console.error('Frontend: Failed to load unread count:', error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      // Mark as read first
      await markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate to relevant page
      if (notification && user?.role) {
        const route = getNotificationRoute(notification, user.role);
        if (route) {
          navigate(route);
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!user) return null;

  const menuItems = getMenuItems(user.role);

  const profilePath = user.role === 'STUDENT' ? '/student/profile' : user.role === 'FACULTY' ? '/faculty/profile' : (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin/profile' : null;

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
    items: notifications.length > 0 ? [
      ...notifications.map((notif) => ({
        key: notif.id,
        label: (
          <div 
            className={`max-w-80 p-2 cursor-pointer hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
            onClick={() => handleNotificationClick(notif.id)}
          >
            <div className="flex justify-between items-start mb-1">
              <Text strong className="text-sm">
                {notif.title}
              </Text>
              {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />}
            </div>
            <Text className="text-xs text-gray-600 block mb-1">
              {notif.message}
            </Text>
            <Text className="text-xs text-gray-400">
              {new Date(notif.createdAt).toLocaleString()}
            </Text>
          </div>
        ),
      })),
      { type: 'divider' as const },
      {
        key: 'mark-all-read',
        label: (
          <div className="text-center">
            <Button type="link" size="small" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          </div>
        ),
      },
    ] : [
      {
        key: 'no-notifications',
        label: (
          <div className="max-w-70 text-center text-muted-foreground p-2">
            No notifications yet
            
          </div>
        ),
      },
    ],
  };

  const siderContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-16 border-b ">
        <motion.div animate={{ opacity: 1 }} className="flex items-center gap-2 text-lg font-bold overflow-hidden">
          <div className="h-7 w-7 shrink-0">
            <img src={logo} alt="CampusCure" className="h-full w-full object-fill" />
          </div>
          {(!collapsed || isMobile) && 
          <span>
           <span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
    Campus
  </span>
  <span className="text-[#041A47]">
    Cure
  </span>
          </span>}
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

  return (
    <Layout className="h-screen">
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
            <Input prefix={<SearchOutlined className="text-muted-foreground" />} placeholder="Search..." className="max-w-60 hidden md:block" variant="filled" />
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
              <Button type="text" icon={darkMode ? <SunOutlined style={{ fontSize: 18, color: '#faad14' }} /> : <MoonOutlined style={{ fontSize: 18 }} />} onClick={() => setDarkMode(!darkMode)} />
            </motion.div>
            <Dropdown 
              menu={notifMenu} 
              trigger={['click']} 
              placement="bottomRight"
              onOpenChange={(open) => {
                if (open) {
                  loadNotifications();
                }
              }}
            >
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