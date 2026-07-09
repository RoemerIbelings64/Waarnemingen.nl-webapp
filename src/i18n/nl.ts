/**
 * Alle UI-teksten van de app op één plek. De app is eentalig Nederlands;
 * deze structuur maakt latere talen mogelijk zonder de schermen te wijzigen.
 */
export const nl = {
  app: {
    name: 'Natuurkaart',
    tagline: 'Ontdek de natuur om je heen',
  },
  map: {
    myLocation: 'Mijn locatie',
    filters: 'Filters',
    search: 'Zoek soort of plaats',
    loading: 'Waarnemingen laden…',
    searchThisArea: 'Zoek in dit gebied',
    observationsHere: (n: number) =>
      n === 1 ? '1 waarneming' : `${n} waarnemingen`,
  },
  list: {
    title: 'Waarnemingen',
    today: 'Vandaag',
    yesterday: 'Gisteren',
    thisWeek: 'Deze week',
    earlier: 'Eerder',
    empty: 'Geen waarnemingen in dit gebied',
    emptyHint: 'Vergroot de zoekstraal of het datumbereik.',
    countLabel: (n: number) =>
      n === 1 ? '1 waarneming' : `${n} waarnemingen`,
    distanceAway: (m: string) => `${m} verderop`,
  },
  filters: {
    title: 'Filters',
    speciesGroup: 'Soortgroep',
    allGroups: 'Alle groepen',
    period: 'Periode',
    radius: 'Zoekstraal',
    radiusValue: (km: number) => `${km} km`,
    radiusMaxNote: 'De API staat maximaal 10 km toe.',
    periodOptions: {
      today: 'Vandaag',
      d3: '3 dagen',
      d7: '7 dagen',
      d30: '30 dagen',
    },
    apply: 'Toon waarnemingen',
    reset: 'Wis filters',
  },
  search: {
    title: 'Zoeken',
    placeholder: 'Zoek een soort of plaats…',
    hint: 'Zoek bijvoorbeeld op “ransuil”, “uilen” of “Vondelpark”.',
    speciesSection: 'Soorten',
    locationSection: 'Plaatsen',
    noResults: 'Niets gevonden',
    searching: 'Zoeken…',
    clearSpecies: 'Soortfilter wissen',
    activeSpeciesFilter: (name: string) => `Gefilterd op: ${name}`,
  },
  detail: {
    title: 'Waarneming',
    observedOn: 'Waargenomen op',
    observer: 'Waarnemer',
    count: 'Aantal',
    location: 'Locatie',
    rarity: 'Zeldzaamheid',
    about: 'Over deze soort',
    openOnWebsite: 'Bekijk op waarneming.nl',
    noPhoto: 'Geen foto beschikbaar',
    loadingInfo: 'Informatie laden…',
  },
  rarity: {
    0: 'Onbekend',
    1: 'Algemeen',
    2: 'Vrij algemeen',
    3: 'Vrij zeldzaam',
    4: 'Zeldzaam',
    5: 'Zeer zeldzaam',
  } as Record<number, string>,
  location: {
    permissionTitle: 'Locatie gebruiken',
    permissionBody:
      'Sta locatie toe om waarnemingen in jouw omgeving te zien. Je kunt ook een plaats zoeken.',
    permissionDenied:
      'Locatie is uitgeschakeld. We tonen waarnemingen rond Amsterdam. Zoek een plaats om ergens anders te kijken.',
    allow: 'Locatie toestaan',
    searchInstead: 'Plaats zoeken',
  },
  errors: {
    generic: 'Er ging iets mis',
    genericHint: 'Controleer je verbinding en probeer het opnieuw.',
    retry: 'Opnieuw proberen',
    rateLimited: 'Even rustig aan — te veel verzoeken. Probeer het zo weer.',
    offline: 'Geen internetverbinding',
  },
  common: {
    close: 'Sluiten',
    back: 'Terug',
    cancel: 'Annuleren',
    ok: 'Oké',
    loading: 'Laden…',
  },
} as const;

export type Strings = typeof nl;
