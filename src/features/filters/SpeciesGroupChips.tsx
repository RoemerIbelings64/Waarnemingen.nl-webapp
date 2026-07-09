import { nl } from '../../i18n/nl';
import { GROUP_EMOJI } from '../../theme/colors';
import { useFilterStore } from './filterStore';
import { useSpeciesGroups } from './useSpeciesGroups';

/** Horizontaal scrollbare rij met soortgroep-chips boven de kaart. */
export function SpeciesGroupChips() {
  const { data: groups } = useSpeciesGroups();
  const speciesGroup = useFilterStore((s) => s.speciesGroup);
  const setSpeciesGroup = useFilterStore((s) => s.setSpeciesGroup);

  return (
    <div className="chips-row">
      <button
        className={`chip${speciesGroup == null ? ' chip-active' : ''}`}
        onClick={() => setSpeciesGroup(null)}
      >
        {nl.filters.allGroups}
      </button>
      {(groups ?? []).map((g) => (
        <button
          key={g.id}
          className={`chip${speciesGroup === g.id ? ' chip-active' : ''}`}
          onClick={() => setSpeciesGroup(speciesGroup === g.id ? null : g.id)}
        >
          {GROUP_EMOJI[g.id] ?? '•'} {g.name}
        </button>
      ))}
    </div>
  );
}
