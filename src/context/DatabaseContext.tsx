import { createContext, useContext, useState, useCallback } from "react";
import type { FC, ReactNode } from "react";

interface SelectedDatabase {
  connectionId: string;
  connectionName: string;
  dbName: string;
}

interface DatabaseContextType {
  selected: SelectedDatabase | null;
  selectDatabase: (connectionId: string, connectionName: string, dbName: string) => void;
  clearSelection: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selected, setSelected] = useState<SelectedDatabase | null>(null);

  const selectDatabase = useCallback(
    (connectionId: string, connectionName: string, dbName: string) => {
      setSelected({ connectionId, connectionName, dbName });
    },
    [],
  );

  const clearSelection = useCallback(() => setSelected(null), []);

  return (
    <DatabaseContext.Provider value={{ selected, selectDatabase, clearSelection }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error("useDatabase must be used inside DatabaseProvider");
  return ctx;
};
