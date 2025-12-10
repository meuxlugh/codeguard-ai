import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  isOwner: boolean;
}

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setWorkspaces(data.workspaces);

        // Set current workspace from localStorage or default to first
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        const savedWorkspace = data.workspaces.find((w: Workspace) => w.id === savedWorkspaceId);

        if (savedWorkspace) {
          setCurrentWorkspaceState(savedWorkspace);
        } else if (data.workspaces.length > 0) {
          setCurrentWorkspaceState(data.workspaces[0]);
          localStorage.setItem('currentWorkspaceId', data.workspaces[0].id);
        }
      } else {
        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspaceState(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const login = () => {
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      localStorage.removeItem('currentWorkspaceId');
      window.location.href = '/';
    }
  };

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
  };

  const refreshAuth = async () => {
    await fetchAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setCurrentWorkspace,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
