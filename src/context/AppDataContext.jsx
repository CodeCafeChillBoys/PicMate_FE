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
  mockMessages: [],
  favoritePhotographerIds: [],
  stats: null,
};

export function AppDataProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiClient.getBootstrap()
      .then((res) => {
        if (isMounted && res && Object.keys(res).length) {
          console.info('Bootstrap data loaded from API:', res);
          setData((prev) => ({ ...prev, ...res }));
          setError(null);
        }
      })
      .catch(async (err) => {
        if (isMounted) {
          console.warn('Failed to fetch bootstrap data from API:', err);
          // Try local fallback in public/bootstrap.json
          try {
            const fallbackRes = await fetch('/bootstrap.json');
            if (fallbackRes.ok) {
              const fallback = await fallbackRes.json();
              setData((prev) => ({ ...prev, ...fallback }));
              setError(null);
              console.info('Loaded bootstrap data from local fallback');
            } else {
              setError(err.message || String(err));
            }
          } catch (fallbackErr) {
            console.warn('Failed to load local bootstrap fallback:', fallbackErr);
            setError(err.message || String(err));
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavoriteId = (grapherId) => {
    setData((prev) => {
      const ids = prev.favoritePhotographerIds || [];
      const exists = ids.includes(grapherId);
      const nextIds = exists 
        ? ids.filter(id => id !== grapherId)
        : [...ids, grapherId];
      return {
        ...prev,
        favoritePhotographerIds: nextIds
      };
    });
  };

  const value = useMemo(() => ({ data, loading, error, toggleFavoriteId }), [data, loading, error]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// Allow exporting the hook without breaking fast refresh in dev tooling
// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return ctx;
}

