import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FRONTEND_GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const normalizeOrigins = (origins = []) => {
  if (!Array.isArray(origins)) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  const deduped = new Set(
    origins
      .map(origin => (typeof origin === 'string' ? origin.trim() : ''))
      .filter(Boolean)
  );

  if (!deduped.size) {
    DEFAULT_ALLOWED_ORIGINS.forEach(origin => deduped.add(origin));
  }

  return Array.from(deduped);
};

/**
 * Fetches Google Sign-In configuration from the backend so that the frontend
 * always uses the same client ID and allowed origins as the API.
 */
export const useGoogleConfig = () => {
  const [clientId, setClientId] = useState(FRONTEND_GOOGLE_CLIENT_ID);
  const [allowedOrigins, setAllowedOrigins] = useState(DEFAULT_ALLOWED_ORIGINS);
  const [status, setStatus] = useState(
    FRONTEND_GOOGLE_CLIENT_ID ? 'loaded' : 'loading'
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/google/config`, {
          timeout: 7000,
        });

        if (cancelled) {
          return;
        }

        const serverClientId = response.data?.clientId;
        const serverOrigins = normalizeOrigins(response.data?.allowedOrigins);

        if (serverClientId) {
          if (
            FRONTEND_GOOGLE_CLIENT_ID &&
            FRONTEND_GOOGLE_CLIENT_ID !== serverClientId
          ) {
            console.warn(
              '[GoogleAuth] Frontend client ID does not match backend configuration. Using backend value.'
            );
          }
          setClientId(serverClientId);
        } else if (!FRONTEND_GOOGLE_CLIENT_ID) {
          throw new Error('Server did not provide a Google client ID.');
        }

        setAllowedOrigins(serverOrigins);
        setStatus('loaded');
        setError(null);
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        if (!FRONTEND_GOOGLE_CLIENT_ID) {
          setStatus('error');
          setError(fetchError);
          console.error('[GoogleAuth] Failed to load Google Sign-In config', fetchError);
        } else {
          setStatus('loaded');
          setError(null);
          console.warn(
            '[GoogleAuth] Falling back to frontend Google client ID because backend configuration could not be loaded.',
            fetchError
          );
        }
      }
    };

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(
    () => ({
      clientId,
      allowedOrigins,
      status,
      error,
      enabled: Boolean(clientId),
    }),
    [allowedOrigins, clientId, error, status]
  );

  return derived;
};

export default useGoogleConfig;
