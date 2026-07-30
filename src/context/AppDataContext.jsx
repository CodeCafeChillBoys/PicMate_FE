import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';

const AppDataContext = createContext(null);

const DEFAULT_PRESETS = [
  {
    id: 'p1',
    name: 'Golden Hour Sunset',
    category: 'Warm',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    downloads: '12.5K',
    price: 49000
  },
  {
    id: 'p2',
    name: 'Korean Tone & Glow',
    category: 'Da sáng Hàn',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    downloads: '8.2K',
    price: 69000
  },
  {
    id: 'p3',
    name: 'Vintage Film 1998',
    category: 'Ngoài trời',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    downloads: '15.1K',
    price: 59000
  },
  {
    id: 'p4',
    name: 'Moody Dark Cafe',
    category: 'Cafe',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    downloads: '6.8K',
    price: 39000
  }
];

const defaultData = {
  photographers: [],
  services: [],
  styles: [],
  presets: DEFAULT_PRESETS,
  bookings: [],
  bookingStatuses: [],
  demoAccounts: [],
  testimonials: [],
  membershipPlans: [],
  mockMessages: [],
  favoritePhotographerIds: [],
  stats: null,
};

const normalizePresets = (rawPresets) => {
  let list = Array.isArray(rawPresets) && rawPresets.length > 0 ? [...rawPresets] : [];
  list = list.map(p => ({
    ...p,
    image: p.image || p.imageUrl || DEFAULT_PRESETS[0].image,
    imageUrl: p.imageUrl || p.image || DEFAULT_PRESETS[0].imageUrl,
    downloads: p.downloads || p.downloadCount || '1.2K'
  }));
  if (list.length < 4) {
    DEFAULT_PRESETS.forEach(def => {
      if (list.length < 4 && !list.some(item => item.id === def.id || item.name === def.name)) {
        list.push(def);
      }
    });
  }
  return list;
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
          const presets = normalizePresets(res.presets);
          setData((prev) => ({ ...prev, ...res, presets }));
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
              const presets = normalizePresets(fallback.presets);
              setData((prev) => ({ ...prev, ...fallback, presets }));
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

