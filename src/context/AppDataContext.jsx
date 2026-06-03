import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';

const AppDataContext = createContext(null);

const defaultData = {
  photographers: [],
  services: [],
  styles: [],
  presets: [],
  bookings: [],
  bookingStatuses: [],
  demoAccounts: [],
  testimonials: [],
  membershipPlans: [],
  mockUsers: [],
  mockDisputes: [],
  mockActivities: [],
  mockMessages: [],
  favoritePhotographerIds: [],
};

export function AppDataProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient.getBootstrap()
      .then((res) => {
        if (isMounted) {
          setData((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {
        // Keep defaults if API is unavailable.
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({ data, setData, loading }), [data, loading]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return ctx;
}

