import { useMemo } from 'react';
import type { Observation } from '../../api/types';
import { nl } from '../../i18n/nl';
import { ObservationRow } from '../detail/ObservationRow';
import { EmptyView, ErrorView } from '../../components/StateViews';
import { dateBucket, bucketLabel, type DateBucket } from '../../utils/dates';
import { distanceMeters } from '../../utils/geo';
import { obsLat, obsLng } from '../../utils/observations';
import { useDragSheet } from '../../utils/useDragSheet';
import { useMediaQuery } from '../../utils/useMediaQuery';

/** Snappunten als in de native app: peek / half / vrijwel volledig. */
const SNAP_FRACTIONS = [0.14, 0.55, 0.92];

interface Props {
  observations: Observation[];
  totalCount: number;
  center: { latitude: number; longitude: number } | null;
  isError: boolean;
  onRetry: () => void;
  onSelect: (o: Observation) => void;
}

const BUCKET_ORDER: DateBucket[] = ['today', 'yesterday', 'thisWeek', 'earlier'];

/** Lijstpaneel met waarnemingen, gegroepeerd per periode. */
export function ObservationsList({
  observations,
  totalCount,
  center,
  isError,
  onRetry,
  onSelect,
}: Props) {
  const grouped = useMemo(() => {
    const groups = new Map<DateBucket, { o: Observation; d?: number }[]>();
    for (const o of observations) {
      const bucket = dateBucket(o.date);
      const d = center
        ? distanceMeters(center.latitude, center.longitude, obsLat(o), obsLng(o))
        : undefined;
      const list = groups.get(bucket) ?? [];
      list.push({ o, d });
      groups.set(bucket, list);
    }
    return BUCKET_ORDER.filter((b) => groups.get(b)?.length).map((b) => ({
      bucket: b,
      label: bucketLabel(b),
      rows: groups.get(b)!,
    }));
  }, [observations, center]);

  // Op mobiel is de lijst een sleepbare bottom sheet met snappunten; op breed
  // scherm een vaste zijkolom (dan is slepen uitgeschakeld).
  const isDesktop = useMediaQuery('(min-width: 820px)');
  const { heightPx, dragging, handleProps } = useDragSheet({
    snapFractions: SNAP_FRACTIONS,
    initialIndex: 0,
    enabled: !isDesktop,
  });

  return (
    <div
      className="list-panel"
      style={
        !isDesktop && heightPx != null
          ? {
              height: heightPx,
              transition: dragging ? 'none' : 'height 0.25s ease',
            }
          : undefined
      }
    >
      <div className="sheet-handle" {...handleProps} aria-hidden>
        <span />
      </div>
      <div className="list-header">
        <h2 className="list-title">{nl.list.title}</h2>
        <span className="list-count">
          {nl.list.countLabel(observations.length)}
          {totalCount > observations.length ? ` van ${totalCount}` : ''}
        </span>
      </div>

      <div className="list-scroll">
        {isError ? (
          <ErrorView onRetry={onRetry} />
        ) : grouped.length === 0 ? (
          <EmptyView title={nl.list.empty} hint={nl.list.emptyHint} />
        ) : (
          grouped.map((section) => (
            <div key={section.bucket}>
              <p className="section-label">{section.label}</p>
              {section.rows.map(({ o, d }) => (
                <ObservationRow
                  key={o.id}
                  observation={o}
                  distanceM={d}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
