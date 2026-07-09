import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_CENTER } from './mapBounds';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable';

export interface UserLocationResult {
  location: { latitude: number; longitude: number } | null;
  status: LocationStatus;
  request: () => void;
}

/**
 * Beheert de browser-geolocatie. Bij weigering blijft `location` null en valt
 * de aanroeper terug op {@link FALLBACK_CENTER}.
 */
export function useUserLocation(): UserLocationResult {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setStatus('granted');
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { location, status, request };
}

export { FALLBACK_CENTER };
