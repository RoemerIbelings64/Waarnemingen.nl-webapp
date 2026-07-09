import { memo } from 'react';
import type { Observation } from '../../api/types';
import { colorForGroup } from '../../theme/colors';
import { formatRelative } from '../../utils/dates';
import { formatDistance } from '../../utils/geo';

interface Props {
  observation: Observation;
  distanceM?: number;
  onSelect: (o: Observation) => void;
}

/** Eén rij in de waarnemingslijst. */
function ObservationRowBase({ observation, distanceM, onSelect }: Props) {
  const species = observation.species_detail;
  const groupColor = colorForGroup(species?.group);
  const isRare = (observation.rarity ?? 0) >= 3;

  return (
    <button className="obs-row" onClick={() => onSelect(observation)}>
      <span className="obs-thumb" style={{ background: 'var(--surface-alt)' }}>
        <span
          className={observation.has_photo ? 'obs-thumb-tag' : 'obs-dot'}
          style={{ background: groupColor }}
        />
      </span>
      <span className="obs-body">
        <span className="obs-name-row">
          <span className="obs-name">{species?.name ?? 'Onbekende soort'}</span>
          {isRare ? <span className="obs-rare-dot" /> : null}
        </span>
        <span className="obs-sci">{species?.scientific_name ?? ''}</span>
        <span className="obs-meta">
          {formatRelative(observation.date, observation.time)}
          {distanceM != null ? ` · ${formatDistance(distanceM)}` : ''}
          {observation.number > 1 ? ` · ${observation.number}×` : ''}
        </span>
      </span>
    </button>
  );
}

export const ObservationRow = memo(ObservationRowBase);
