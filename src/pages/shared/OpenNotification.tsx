/**
 * Where a clicked push notification lands (CC-41).
 *
 * The service worker knows only the notification id - routing depends on the
 * notification's type and the reader's role, which the app already knows how
 * to resolve (getNotificationRoute). This page does that lookup, marks the
 * notification read, and moves on.
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { getNotificationRoute, getNotifications, markAsRead } from '@/api/notifications';
import { useAuth } from '@/context/AuthContext';
import { getRoleRedirect } from '@/lib/authUtils';

const OpenNotification = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    void (async () => {
      const fallback = getRoleRedirect(user.role, user);
      try {
        const { notifications } = await getNotifications(50);
        const match = notifications.find((n) => n.id === id);
        if (match && !match.read) await markAsRead(match.id).catch(() => undefined);
        const route = match ? getNotificationRoute(match, user.role) : null;
        if (!cancelled) navigate(route ?? fallback, { replace: true });
      } catch {
        if (!cancelled) navigate(fallback, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user, navigate]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default OpenNotification;
