import { nl } from '../../i18n/nl';
import { GROUP_EMOJI } from '../../theme/colors';
import { type PeriodKey, useFilterStore } from './filterStore';
import { useSpeciesGroups } from './useSpeciesGroups';

const PERIOD_ORDER: PeriodKey[] = ['today', 'd3', 'd7', 'd30'];
const RADIUS_STEPS_KM = [1, 2, 5, 10];

const periodLabel: Record<PeriodKey, string> = {
  today: nl.filters.periodOptions.today,
  d3: nl.filters.periodOptions.d3,
  d7: nl.filters.periodOptions.d7,
  d30: nl.filters.periodOptions.d30,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Zijpaneel/onderpaneel met alle filters. */
export function FilterPanel({ open, onClose }: Props) {
  const { data: groups } = useSpeciesGroups();
  const {
    speciesGroup,
    period,
    radius,
    setSpeciesGroup,
    setPeriod,
    setRadius,
    reset,
  } = useFilterStore();

  if (!open) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="panel filter-panel" role="dialog" aria-label={nl.filters.title}>
        <div className="panel-header">
          <h2 className="panel-title">{nl.filters.title}</h2>
          <button className="link-btn" onClick={reset}>
            {nl.filters.reset}
          </button>
        </div>

        <div className="panel-body">
          <p className="field-label">{nl.filters.period}</p>
          <div className="segments">
            {PERIOD_ORDER.map((key) => (
              <button
                key={key}
                className={`segment${period === key ? ' segment-active' : ''}`}
                onClick={() => setPeriod(key)}
              >
                {periodLabel[key]}
              </button>
            ))}
          </div>

          <p className="field-label">
            {nl.filters.radius} · {nl.filters.radiusValue(Math.round(radius / 1000))}
          </p>
          <div className="segments">
            {RADIUS_STEPS_KM.map((km) => (
              <button
                key={km}
                className={`segment${
                  Math.round(radius / 1000) === km ? ' segment-active' : ''
                }`}
                onClick={() => setRadius(km * 1000)}
              >
                {km} km
              </button>
            ))}
          </div>
          <input
            className="radius-slider"
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            aria-label={nl.filters.radius}
          />
          <p className="field-note">{nl.filters.radiusMaxNote}</p>

          <p className="field-label">{nl.filters.speciesGroup}</p>
          <div className="group-grid">
            <button
              className={`group-cell${speciesGroup == null ? ' group-cell-active' : ''}`}
              onClick={() => setSpeciesGroup(null)}
            >
              <span className="group-emoji">✦</span>
              <span>{nl.filters.allGroups}</span>
            </button>
            {(groups ?? []).map((g) => (
              <button
                key={g.id}
                className={`group-cell${
                  speciesGroup === g.id ? ' group-cell-active' : ''
                }`}
                onClick={() => setSpeciesGroup(speciesGroup === g.id ? null : g.id)}
              >
                <span className="group-emoji">{GROUP_EMOJI[g.id] ?? '•'}</span>
                <span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn-primary btn-block" onClick={onClose}>
            {nl.filters.apply}
          </button>
        </div>
      </div>
    </>
  );
}
