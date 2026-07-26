import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AppState {
  isSidebarOpen: boolean;
  selectedMachineId: string | null;
  activeSessionId: string | null;
}

interface AppContextType extends AppState {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSelectedMachineId: (id: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        selectedMachineId,
        activeSessionId,
        toggleSidebar,
        setSidebarOpen,
        setSelectedMachineId,
        setActiveSessionId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
