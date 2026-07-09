import { useMemo } from 'react';
import Supercluster from 'supercluster';
import type { Observation } from '../../api/types';
import { obsLat, obsLng } from '../../utils/observations';

export interface ViewportBBox {
  west: number;
  south: number;
  east: number;
  north: number;
  zoom: number;
}

export interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  groupId: number | null;
  observation?: Observation;
  clusterId?: number;
  /** Zoomniveau waarop dit cluster uiteenvalt (voor "inzoomen bij klik"). */
  expansionZoom?: number;
}

interface Props {
  groupId: number | null;
  observationId: number;
}

/**
 * Clustert waarnemingen voor de huidige Leaflet-viewport met supercluster.
 * Leaflet-zoom is al een geheel getal dat supercluster direct gebruikt.
 */
export function useClusters(
  observations: Observation[],
  viewport: ViewportBBox | null,
): ClusterPoint[] {
  const index = useMemo(() => {
    const sc = new Supercluster<Props>({ radius: 60, maxZoom: 18 });
    sc.load(
      observations.map((o) => ({
        type: 'Feature' as const,
        properties: {
          groupId: o.species_detail?.group ?? null,
          observationId: o.id,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [obsLng(o), obsLat(o)],
        },
      })),
    );
    return sc;
  }, [observations]);

  return useMemo(() => {
    if (!viewport) return [];
    const byId = new Map(observations.map((o) => [o.id, o]));
    const clusters = index.getClusters(
      [viewport.west, viewport.south, viewport.east, viewport.north],
      Math.round(viewport.zoom),
    );
    return clusters.map((c): ClusterPoint => {
      const [longitude, latitude] = c.geometry.coordinates;
      const props = c.properties as Supercluster.ClusterProperties & Props;
      if ('cluster' in props && props.cluster) {
        return {
          id: `cluster-${props.cluster_id}`,
          latitude,
          longitude,
          count: props.point_count,
          groupId: dominantGroup(index, props.cluster_id),
          clusterId: props.cluster_id,
          expansionZoom: safeExpansionZoom(index, props.cluster_id),
        };
      }
      return {
        id: `obs-${props.observationId}`,
        latitude,
        longitude,
        count: 1,
        groupId: props.groupId,
        observation: byId.get(props.observationId),
      };
    });
  }, [index, viewport, observations]);
}

function safeExpansionZoom(
  index: Supercluster<Props>,
  clusterId: number,
): number | undefined {
  try {
    return index.getClusterExpansionZoom(clusterId);
  } catch {
    return undefined;
  }
}

/** Bepaalt de meest voorkomende soortgroep in een cluster (voor de kleur). */
function dominantGroup(
  index: Supercluster<Props>,
  clusterId: number,
): number | null {
  try {
    const leaves = index.getLeaves(clusterId, 30);
    const counts = new Map<number, number>();
    for (const leaf of leaves) {
      const g = (leaf.properties as Props).groupId;
      if (g == null) continue;
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    let best: number | null = null;
    let bestN = 0;
    for (const [g, n] of counts) {
      if (n > bestN) {
        best = g;
        bestN = n;
      }
    }
    return best;
  } catch {
    return null;
  }
}
