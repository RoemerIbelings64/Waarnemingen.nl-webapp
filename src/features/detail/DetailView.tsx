import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { nl } from '../../i18n/nl';
import { colorForGroup } from '../../theme/colors';
import { useIsDark } from '../../theme/useTheme';
import { formatDate } from '../../utils/dates';
import { LoadingView, ErrorView } from '../../components/StateViews';
import {
  extractDescription,
  useObservationDetail,
  useSpeciesInformation,
} from './useObservationDetail';

/** Detailscherm van één waarneming (route /waarneming/:id). */
export function DetailView() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(params.id);
  const isDark = useIsDark();

  const { data: obs, isLoading, isError, refetch } = useObservationDetail(id);
  const speciesId = obs?.species_detail?.id;
  const { data: info } = useSpeciesInformation(speciesId);
  const description = useMemo(() => extractDescription(info), [info]);
  const [photoIndex, setPhotoIndex] = useState(0);

  const close = () => navigate('/');

  return (
    <div className="detail-overlay">
      <div className="scrim" onClick={close} />
      <div className="panel detail-panel" role="dialog" aria-label={nl.detail.title}>
        <button className="detail-close" onClick={close} aria-label={nl.common.close}>
          ←
        </button>

        {isLoading ? (
          <LoadingView label={nl.common.loading} />
        ) : isError || !obs ? (
          <ErrorView onRetry={refetch} />
        ) : (
          (() => {
            const species = obs.species_detail;
            const groupColor = colorForGroup(species?.group);
            const photos = obs.photos ?? [];
            const [lng, lat] = obs.point.coordinates;
            const rarityLabel =
              obs.rarity != null ? nl.rarity[obs.rarity] : undefined;
            const tileUrl = isDark
              ? 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

            return (
              <div className="detail-scroll">
                <div className="detail-hero">
                  {photos.length > 0 ? (
                    <>
                      <img
                        className="detail-photo"
                        src={photos[photoIndex]}
                        alt={species?.name ?? ''}
                      />
                      {photos.length > 1 ? (
                        <div className="photo-dots">
                          {photos.map((_, i) => (
                            <button
                              key={i}
                              className={`photo-dot${i === photoIndex ? ' active' : ''}`}
                              onClick={() => setPhotoIndex(i)}
                              aria-label={`Foto ${i + 1}`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="detail-nophoto">
                      <span className="big-dot" style={{ background: groupColor }} />
                      <span>{nl.detail.noPhoto}</span>
                    </div>
                  )}
                </div>

                <div className="detail-content">
                  <div className="detail-title-row">
                    <span className="group-bar" style={{ background: groupColor }} />
                    <div>
                      <h1 className="detail-name">
                        {species?.name ?? 'Onbekende soort'}
                      </h1>
                      <p className="detail-sci">{species?.scientific_name ?? ''}</p>
                    </div>
                  </div>

                  <div className="fact-card">
                    <Fact
                      label={nl.detail.observedOn}
                      value={formatDate(obs.date, obs.time)}
                    />
                    <Fact label={nl.detail.count} value={`${obs.number}`} />
                    {obs.location_detail?.name ? (
                      <Fact
                        label={nl.detail.location}
                        value={obs.location_detail.name}
                      />
                    ) : null}
                    {rarityLabel ? (
                      <Fact label={nl.detail.rarity} value={rarityLabel} />
                    ) : null}
                  </div>

                  <div className="detail-map">
                    <MapContainer
                      className="mini-map"
                      center={[lat, lng]}
                      zoom={13}
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                      doubleClickZoom={false}
                      attributionControl={false}
                    >
                      <TileLayer url={tileUrl} detectRetina />
                      <Marker
                        position={[lat, lng]}
                        icon={L.divIcon({
                          className: 'nk-marker',
                          html: `<div class="nk-pin" style="border-color:${groupColor}"><span style="background:${groupColor}"></span></div>`,
                          iconSize: [22, 22],
                          iconAnchor: [11, 11],
                        })}
                      />
                    </MapContainer>
                  </div>

                  {description ? (
                    <>
                      <h2 className="detail-section">{nl.detail.about}</h2>
                      <p className="detail-body">{description}</p>
                    </>
                  ) : null}

                  <a
                    className="btn-primary btn-block"
                    href={obs.permalink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {nl.detail.openOnWebsite}
                  </a>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  );
}
