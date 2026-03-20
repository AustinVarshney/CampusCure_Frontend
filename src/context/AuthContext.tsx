import { getCurrentUser, logoutUser } from '@/api/auth';
import { User } from '@/types';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const userData = await getCurrentUser();
      setUser(userData.user || userData);
    } catch {
      // silently fail — user stays as-is
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData.user || userData);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

      // Keep auth state in sync when returning to the tab/window.
      useEffect(() => {
        const handleFocus = () => {
          void refreshUser();
        };

        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            void refreshUser();
          }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          window.removeEventListener('focus', handleFocus);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }, [refreshUser]);

      // Poll while account is pending to reflect approval changes in near real-time.
      useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user || user.approvalStatus !== 'PENDING') return;

        const timer = window.setInterval(() => {
          void refreshUser();
        }, 10000);

        return () => {
          window.clearInterval(timer);
        };
      }, [refreshUser, user]);

  const login = (token: string, userData: User): void => {
    localStorage.setItem('token', token);
    setUser(userData);
    // Pull full user payload (including approval status/profile flags) right after login.
    void refreshUser();
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};