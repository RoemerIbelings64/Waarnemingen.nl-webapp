import { useState } from 'react';
import { nl } from '../../i18n/nl';
import { colorForGroup } from '../../theme/colors';
import { useDebounce } from '../../utils/useDebounce';
import { useLocationSearch, useSpeciesSearch } from './useSearch';
import { useFilterStore } from '../filters/filterStore';
import { useMapCenterStore } from '../map/mapCenterStore';
import { lookupLocation, type PdokSuggestion } from '../../api/pdok';
import type { Species } from '../../api/types';

interface Props {
  onClose: () => void;
}

/** Zoekoverlay: soorten (filtert de kaart) en plaatsen (verplaatst de kaart). */
export function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const setSpeciesFilter = useFilterStore((s) => s.setSpeciesFilter);
  const setPendingCenter = useMapCenterStore((s) => s.setPendingCenter);

  const speciesQuery = useSpeciesSearch(debounced);
  const locationQuery = useLocationSearch(debounced);

  const busy = speciesQuery.isFetching || locationQuery.isFetching;
  const hasQuery = debounced.trim().length >= 2;
  const species = speciesQuery.data ?? [];
  const locations = locationQuery.data ?? [];

  const pickSpecies = (picked: Species) => {
    const related = species.filter(
      (s) => s.name === picked.name || s.group === picked.group,
    );
    const ids = new Set<number>([picked.id, ...related.map((s) => s.id)]);
    // Bij een brede zoekterm ("uil") filteren we op alle gevonden soorten in
    // de groep; het label toont dan de zoekterm en niet één soortnaam.
    const label = ids.size > 1 ? debounced.trim() : picked.name;
    setSpeciesFilter({ label, speciesIds: [...ids] });
    onClose();
  };

  const pickLocation = async (suggestion: PdokSuggestion) => {
    const loc = await lookupLocation(suggestion.id);
    if (loc) {
      setPendingCenter({
        latitude: loc.latitude,
        longitude: loc.longitude,
        label: loc.label,
      });
      onClose();
    }
  };

  return (
    <div className="search-overlay">
      <div className="search-bar-row">
        <div className="search-input-wrap">
          <span aria-hidden>🔍</span>
          <input
            autoFocus
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={nl.search.placeholder}
          />
          {busy ? <span className="spinner spinner-sm" aria-hidden /> : null}
        </div>
        <button className="link-btn" onClick={onClose}>
          {nl.common.cancel}
        </button>
      </div>

      <div className="search-results">
        {!hasQuery ? <p className="search-hint">{nl.search.hint}</p> : null}

        {hasQuery && species.length > 0 ? (
          <p className="section-label">{nl.search.speciesSection}</p>
        ) : null}
        {species.map((s) => (
          <button key={`sp-${s.id}`} className="result-row" onClick={() => pickSpecies(s)}>
            <span className="result-dot" style={{ background: colorForGroup(s.group) }} />
            <span className="result-body">
              <span className="result-title">{s.name}</span>
              <span className="result-sub">
                {s.scientific_name}
                {s.group_name ? ` · ${s.group_name}` : ''}
              </span>
            </span>
          </button>
        ))}

        {hasQuery && locations.length > 0 ? (
          <p className="section-label">{nl.search.locationSection}</p>
        ) : null}
        {locations.map((l) => (
          <button
            key={`loc-${l.id}`}
            className="result-row"
            onClick={() => void pickLocation(l)}
          >
            <span className="result-pin" aria-hidden>📍</span>
            <span className="result-body">
              <span className="result-title">{l.label}</span>
              <span className="result-sub">{l.type}</span>
            </span>
          </button>
        ))}

        {hasQuery && !busy && species.length === 0 && locations.length === 0 ? (
          <p className="search-hint">{nl.search.noResults}</p>
        ) : null}
      </div>
    </div>
  );
}
