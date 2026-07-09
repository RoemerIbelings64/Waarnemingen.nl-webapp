import L from 'leaflet';
import { colorForGroup } from '../../theme/colors';
import type { ClusterPoint } from './useClusters';

/**
 * Bouwt een Leaflet divIcon voor een cluster of losse waarneming, gekleurd
 * naar (dominante) soortgroep. Ontwerp gelijk aan de native markers.
 */
export function iconForPoint(point: ClusterPoint): L.DivIcon {
  const color = colorForGroup(point.groupId);
  if (point.count > 1) {
    const label = point.count > 99 ? '99+' : String(point.count);
    const size = point.count > 50 ? 42 : point.count > 10 ? 38 : 34;
    return L.divIcon({
      className: 'nk-marker',
      html: `<div class="nk-cluster" style="background:${color};width:${size}px;height:${size}px">${label}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }
  return L.divIcon({
    className: 'nk-marker',
    html: `<div class="nk-pin" style="border-color:${color}"><span style="background:${color}"></span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
