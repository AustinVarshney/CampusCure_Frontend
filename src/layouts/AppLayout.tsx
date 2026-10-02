import {
  getNotificationRoute,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  type Notification,
} from "@/api/notifications";
import BrandMark from "@/components/brand/BrandMark";
import Wordmark from "@/components/brand/Wordmark";
import AssistantWidget from "@/components/chat/AssistantWidget";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROLE_LABEL } from "@/lib/statusStyles";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import {
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  DownOutlined,
  FormOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, Dropdown, Layout, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Sider, Content } = Layout;

const INITIAL_NOTIFICATION_LIMIT = 4;
const EXPANDED_NOTIFICATION_LIMIT = 100;
const NOTIFICATION_PANEL_HEIGHT = "min(560px, calc(100vh - 96px))";

type NavItem = { key: string; icon: React.ReactNode; label: string };
type NavGroup = { title: string; items: NavItem[] };

/**
 * Sidebar navigation per role.
 *
 * Grouped rather than flat: a signed-in admin has eight destinations, and an
 * undifferentiated list of eight gives no clue which of them belong together.
 * The group title doubles as the collapsed-rail separator.
 */
const getNavGroups = (role: UserRole): NavGroup[] => {
  if (role === "STUDENT")
    return [
      {
        title: "Overview",
        items: [
          {
            key: "/student/dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
        ],
      },
      {
        title: "Complaints",
        items: [
          {
            key: "/student/complaints/new",
            icon: <FormOutlined />,
            label: "Raise Complaint",
          },
          {
            key: "/student/complaints",
            icon: <UnorderedListOutlined />,
            label: "My Complaints",
          },
        ],
      },
      {
        title: "Learning",
        items: [
          {
            key: "/student/doubts",
            icon: <QuestionCircleOutlined />,
            label: "Doubt Community",
          },
          {
            // CC-21. Private to this student; nothing here is visible to
            // anyone else, including the author of a saved doubt.
            key: "/student/doubts/saved",
            icon: <BookOutlined />,
            label: "Saved Doubts",
          },
          {
            key: "/student/reputation",
            icon: <TrophyIcon />,
            label: "Reputation",
          },
          {
            // CC-27: the directory is for everyone, which is the whole point -
            // a student with a flooded bathroom should be able to find the
            // plumber rather than file a complaint and wait to see where it
            // gets routed.
            key: "/student/directory",
            icon: <TeamOutlined />,
            label: "Staff Directory",
          },
        ],
      },
    ];

  if (role === "FACULTY")
    return [
      {
        title: "Overview",
        items: [
          {
            key: "/faculty/dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
        ],
      },
      {
        title: "Workload",
        items: [
          {
            key: "/faculty/complaints",
            icon: <UnorderedListOutlined />,
            label: "Complaints",
          },
          {
            key: "/faculty/doubts",
            icon: <QuestionCircleOutlined />,
            label: "Doubts",
          },
          {
            // CC-25: faculty earn reputation too. Suppressing it would make a
            // faculty member's answers look worthless to the student reading
            // them.
            key: "/faculty/reputation",
            icon: <TrophyIcon />,
            label: "Reputation",
          },
          {
            // CC-26: private to the faculty member and admins.
            key: "/faculty/performance",
            icon: <LineChartOutlined />,
            label: "My Performance",
          },
          {
            // CC-27: the directory is for everyone, which is the whole point -
            // a student with a flooded bathroom should be able to find the
            // plumber rather than file a complaint and wait to see where it
            // gets routed.
            key: "/faculty/directory",
            icon: <TeamOutlined />,
            label: "Staff Directory",
          },
        ],
      },
    ];

  if (role === "SUPER_ADMIN")
    return [
      {
        title: "Overview",
        items: [
          {
            key: "/superadmin/dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
        ],
      },
      {
        title: "Operations",
        items: [
          {
            key: "/admin/complaints",
            icon: <UnorderedListOutlined />,
            label: "All Complaints",
          },
          {
            key: "/superadmin/complaints",
            icon: <UnorderedListOutlined />,
            label: "Escalated",
          },
          { key: "/admin/users", icon: <TeamOutlined />, label: "Users" },
          {
            key: "/admin/faculty-performance",
            icon: <LineChartOutlined />,
            label: "Faculty Performance",
          },
          {
            // CC-27: the directory is for everyone, which is the whole point -
            // a student with a flooded bathroom should be able to find the
            // plumber rather than file a complaint and wait to see where it
            // gets routed.
            key: "/admin/directory",
            icon: <TeamOutlined />,
            label: "Staff Directory",
          },
        ],
      },
      {
        title: "System",
        items: [
          {
            key: "/superadmin/settings",
            icon: <SettingOutlined />,
            label: "Settings",
          },
        ],
      },
    ];

  // ADMIN
  return [
    {
      title: "Overview",
      items: [
        {
          key: "/admin/dashboard",
          icon: <DashboardOutlined />,
          label: "Dashboard",
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          key: "/admin/complaints",
          icon: <UnorderedListOutlined />,
          label: "Complaints",
        },
        { key: "/admin/users", icon: <TeamOutlined />, label: "Users" },
        {
          // CC-26: oversight, not a public leaderboard.
          key: "/admin/faculty-performance",
          icon: <LineChartOutlined />,
          label: "Faculty Performance",
        },
      ],
    },
  ];
};

/** Inline so the nav does not pull in the whole icon set for one glyph. */
function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4 5 5 0 0 0 4 2.9V19H8v2h8v-2h-3v-3.1A5 5 0 0 0 17 13a4 4 0 0 0 4-4V7a2 2 0 0 0-2-2ZM5 9V7h2v4a2 2 0 0 1-2-2Zm14 0a2 2 0 0 1-2 2V7h2v2Z" />
    </svg>
  );
}

/**
 * Titles for routes that have no sidebar entry of their own — profile and the
 * doubt detail pages. Without these the header fell back to the product name,
 * so a signed-in user on their profile saw a bar that just said "CampusCure".
 */
const EXTRA_TITLES: { match: RegExp; label: string }[] = [
  { match: /\/profile$/, label: "My Profile" },
  { match: /\/directory$/, label: "Staff Directory" },
  { match: /\/doubts\/[^/]+$/, label: "Doubt" },
  { match: /\/complaints\/[^/]+$/, label: "Complaint" },
];

/**
 * Below this the sidebar opens as a drawer (see `useIsMobile`); between it and
 * `TABLET_BREAKPOINT` the rail is shown but collapsed, because a 252px sidebar
 * on a 768px tablet leaves barely half the screen for the actual page.
 */
const TABLET_BREAKPOINT = 1024;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < TABLET_BREAKPOINT,
  );
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const loadNotifications = async (limit = INITIAL_NOTIFICATION_LIMIT) => {
    try {
      const response = await getNotifications(limit);
      if (response.success) setNotifications(response.notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.success) setUnreadCount(response.count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);

      await markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (notification && user?.role) {
        const route = getNotificationRoute(notification, user.role);
        if (route) navigate(route);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
      setShowAllNotifications(false);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleToggleNotifications = async () => {
    const next = !showAllNotifications;
    setShowAllNotifications(next);
    await loadNotifications(
      next ? EXPANDED_NOTIFICATION_LIMIT : INITIAL_NOTIFICATION_LIMIT,
    );
  };

  /**
   * Collapse/expand only when the breakpoint is actually crossed, so a manual
   * toggle is not undone by every resize event.
   */
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await loadNotifications(INITIAL_NOTIFICATION_LIMIT);
      await loadUnreadCount();
    };
    void initialize();

    const interval = setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const navGroups = getNavGroups(user.role);
  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem =
    allItems.find((i) => i.key === location.pathname) ??
    // Fall back to the longest prefix match so detail routes such as
    // /student/doubts/:id still light up their section.
    allItems
      .filter((i) => location.pathname.startsWith(i.key))
      .sort((a, b) => b.key.length - a.key.length)[0];

  const exactNavItem = allItems.find((i) => i.key === location.pathname);
  const pageTitle =
    exactNavItem?.label ??
    EXTRA_TITLES.find((t) => t.match.test(location.pathname))?.label ??
    activeItem?.label ??
    "CampusCure";

  const railCollapsed = collapsed && !isMobile;

  const profilePath =
    user.role === "STUDENT"
      ? "/student/profile"
      : user.role === "FACULTY"
        ? "/faculty/profile"
        : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin/profile"
          : null;

  const profileMenu = {
    items: [
      ...(profilePath
        ? [
            {
              key: "view-profile",
              icon: <UserOutlined />,
              label: "My Profile",
            },
          ]
        : []),
      { type: "divider" as const },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") logout();
      if (key === "view-profile" && profilePath) navigate(profilePath);
    },
  };

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, INITIAL_NOTIFICATION_LIMIT);

  const shouldShowSeeMore = unreadCount > INITIAL_NOTIFICATION_LIMIT;

  const notifMenu = {
    items:
      visibleNotifications.length > 0
        ? visibleNotifications.map((notif) => ({
            key: notif.id,
            label: (
              <div
                className={cn(
                  "w-full cursor-pointer rounded-xl px-3 py-2.5 transition-colors",
                  notif.read ? "bg-transparent" : "bg-accent/70",
                  "hover:bg-accent",
                )}
                onClick={() => handleNotificationClick(notif.id)}
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold leading-snug text-foreground">
                    {notif.title}
                  </span>
                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mb-1 text-xs leading-relaxed text-muted-foreground">
                  {notif.message}
                </p>
                <span className="text-[11px] text-muted-foreground/80">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            ),
          }))
        : [
            {
              key: "no-notifications",
              label: (
                <div className="px-3 py-10 text-center">
                  <BellOutlined className="text-2xl text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              ),
            },
          ],
    style: {
      padding: 0,
      margin: 0,
      border: "none",
      boxShadow: "none",
      maxHeight: "none",
      overflow: "visible",
      background: "transparent",
    },
  };

  const notificationPopup = (originNode: React.ReactNode) => (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-[var(--shadow-xl)]"
      style={
        showAllNotifications
          ? {
              width: 384,
              maxWidth: "calc(100vw - 24px)",
              height: NOTIFICATION_PANEL_HEIGHT,
            }
          : { width: 384, maxWidth: "calc(100vw - 24px)" }
      }
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-display text-sm font-bold">Notifications</span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-bold text-primary">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className={cn("p-1.5", showAllNotifications && "flex-1 overflow-y-auto")}>
        {originNode}
      </div>

      {visibleNotifications.length > 0 && (
        <div className="border-t border-border px-3 py-2.5">
          <div
            className={cn(
              "grid gap-2",
              shouldShowSeeMore ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {shouldShowSeeMore && (
              <Button
                size="small"
                className="h-9"
                icon={showAllNotifications ? <UpOutlined /> : <DownOutlined />}
                onClick={handleToggleNotifications}
              >
                {showAllNotifications ? "Show less" : "See more"}
              </Button>
            )}
            <Button
              size="small"
              type="primary"
              className="h-9"
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Sidebar body, shared by the desktop rail and the mobile drawer.
   *
   * Hand-rolled rather than AntD's `Menu`: the grouped headings, the collapsed
   * tooltips and the active indicator bar are all things `Menu` fights us on.
   */
  const siderContent = (
    <div className="flex h-full flex-col bg-sidebar">
      <div
        className={cn(
          "flex h-17 shrink-0 items-center border-b border-sidebar-border",
          railCollapsed ? "justify-center px-2" : "px-5",
        )}
      >
        {railCollapsed ? (
          <BrandMark title="CampusCure" className="h-8 w-8" />
        ) : (
          <Wordmark size="md" />
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            {railCollapsed ? (
              <hr className="mx-2 mb-2 border-t border-sidebar-border" />
            ) : (
              <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {group.title}
              </h2>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = activeItem?.key === item.key;
                const button = (
                  <button
                    onClick={() => {
                      navigate(item.key);
                      if (isMobile) setMobileDrawer(false);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
                      railCollapsed ? "justify-center px-0" : "px-3",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-accent/60 hover:text-accent-foreground",
                    )}
                  >
                    {/* Indicator bar rather than a filled row, so the active
                        item stays legible against the tinted background. */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                    )}
                    <span
                      className={cn(
                        "shrink-0 text-base",
                        active ? "text-sidebar-primary" : "",
                      )}
                    >
                      {item.icon}
                    </span>
                    {!railCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );

                return (
                  <li key={item.key}>
                    {railCollapsed ? (
                      <Tooltip title={item.label} placement="right">
                        {button}
                      </Tooltip>
                    ) : (
                      button
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!railCollapsed && (
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <button
            onClick={() => profilePath && navigate(profilePath)}
            className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-accent/60"
          >
            <Avatar
              size={36}
              style={{ background: "hsl(var(--brand-600))", flexShrink: 0 }}
              icon={<UserOutlined />}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Layout className="h-screen">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={252}
          collapsedWidth={76}
          style={{
            background: "hsl(var(--sidebar))",
            borderRight: "1px solid hsl(var(--sidebar-border))",
          }}
        >
          {siderContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawer}
          onClose={() => setMobileDrawer(false)}
          width={268}
          closable={false}
          styles={{
            body: { padding: 0, background: "hsl(var(--sidebar))" },
          }}
        >
          {siderContent}
        </Drawer>
      )}

      <Layout>
        <header className="flex h-17 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="text"
              aria-label={
                isMobile
                  ? "Open navigation"
                  : collapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
              }
              icon={
                isMobile ? (
                  <MenuOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() =>
                isMobile ? setMobileDrawer(true) : setCollapsed(!collapsed)
              }
            />

            {/* Names the page you are on. Without it the header is a bar of
                chrome that says nothing. */}
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-bold tracking-tight">
                {pageTitle}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {ROLE_LABEL[user.role] ?? user.role} workspace
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />

            <Dropdown
              menu={notifMenu}
              trigger={["click"]}
              placement="bottomRight"
              popupRender={notificationPopup}
              onOpenChange={(open) => {
                if (open) {
                  setShowAllNotifications(false);
                  void loadNotifications(INITIAL_NOTIFICATION_LIMIT);
                  void loadUnreadCount();
                }
              }}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 4]}>
                <Button
                  type="text"
                  aria-label="Notifications"
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                />
              </Badge>
            </Dropdown>

            <Dropdown
              menu={profileMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-accent">
                <Avatar
                  size={34}
                  style={{ background: "hsl(var(--brand-600))" }}
                  icon={<UserOutlined />}
                />
                <span className="hidden text-left md:block">
                  <span className="block max-w-36 truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {ROLE_LABEL[user.role] ?? user.role}
                  </span>
                </span>
              </button>
            </Dropdown>
          </div>
        </header>

        <Content
          className={cn(
            "overflow-auto p-4 md:p-6",
            // Reserve room for the assistant FAB so the last row of a page is
            // not stuck underneath it.
            user.role === "STUDENT" && "pb-24 md:pb-24",
          )}
          style={{ background: "hsl(var(--background))" }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* CC-15: student assistant. Students only - its tools are scoped to a
          student's own records, so it has nothing to offer other roles. */}
      {user.role === "STUDENT" && <AssistantWidget />}
    </Layout>
  );
};

export default AppLayout;
