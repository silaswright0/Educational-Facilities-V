import './App.css';

import { useEffect, useState } from 'react';

import 'leaflet/dist/leaflet.css';

import MapView from './Map';
import getAllFacilities, { getFacilitiesByProvince } from './services/facilitiesService';

interface Facility {
  id: number;
  facilityName: string;
  authorityName: string;
  address: string;
  unit: string;
  postalCode: string;
  municipalityName: string;
  sourceId: string;
  minGrade: string;
  maxGrade: string;
  facilityType: string;
  province: string;
  censusDivisionName: string;
  censusDivisionId: string;
  geometry: string;
  languageMinorityStatus: boolean;
  frenchImmersion: boolean;
  earlyImmersion: boolean;
  middleImmersion: boolean;
  lateImmersion: boolean;
}

type AgeRangeFilter = 'ALL' | 'PRIMARY' | 'SECONDARY' | 'K_12';
type LanguageFilter = 'ALL' | 'ENGLISH' | 'FRENCH_IMMERSION';

const App: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilitiesView, setShowFacilities] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);

  const [ageRangeFilter, setAgeRangeFilter] = useState<AgeRangeFilter>('ALL');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('ALL');

  useEffect(() => {
    getAllFacilities()
      .then((data) => setFacilities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleView = (): void => {
    setShowFacilities((prev) => !prev);
  };

  const provinces: { code: string; name: string }[] = [
    { code: '', name: 'All provinces/territories' },
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
  ];

  const onProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);

    setFilterLoading(true);

    if (provinceCode === '') {
      getAllFacilities()
        .then((data) => setFacilities(data))
        .catch((err) => setError(err.message))
        .finally(() => setFilterLoading(false));
    } else {
      getFacilitiesByProvince(provinceCode)
        .then((data) => setFacilities(data))
        .catch((err) => setError(err.message))
        .finally(() => setFilterLoading(false));
    }
  };

  const clearFilters = (): void => {
    setSelectedProvince('');
    setAgeRangeFilter('ALL');
    setLanguageFilter('ALL');

    setFilterLoading(true);
    getAllFacilities()
      .then((data) => setFacilities(data))
      .catch((err) => setError(err.message))
      .finally(() => setFilterLoading(false));
  };

  const normalizeGrade = (grade: string | null | undefined): number | null => {
    if (!grade) return null;
    const trimmed = grade.trim().toLowerCase();
    if (trimmed === 'k' || trimmed === 'kindergarten') {
      return 0;
    }

    const parsed = parseInt(trimmed, 10);

    return Number.isNaN(parsed) ? null : parsed;
  };

  const matchesAgeRange = (facility: Facility, filter: AgeRangeFilter): boolean => {
    if (filter === 'ALL') {
      return true;
    }

    const min = normalizeGrade(facility.minGrade);
    const max = normalizeGrade(facility.maxGrade);

    // If we do not have any grade info only include it when no age filter is applied
    if (min === null && max === null) {
      return false;
    }

    switch (filter) {
      case 'PRIMARY':
        // Primary / elementary: facility ends at grade 8 or lower
        return max !== null && max <= 8;
      case 'SECONDARY':
        // Secondary: facility starts at grade 9 or higher
        return min !== null && min >= 9;
      case 'K_12':
        // Full range: from kindergarten to grade 12
        return min === 0 && max === 12;
      default:
        return true;
    }
  };

  const matchesLanguage = (facility: Facility, filter: LanguageFilter): boolean => {
    if (filter === 'ALL') {
      return true;
    }

    const hasFrenchImmersion = facility.frenchImmersion
    || facility.earlyImmersion
    || facility.middleImmersion
    || facility.lateImmersion;

    if (filter === 'FRENCH_IMMERSION') {
      // Any French immersion option available
      return !!hasFrenchImmersion;
    }

    if (filter === 'ENGLISH') {
      // Treat "English only" as no French immersion flags
      return !hasFrenchImmersion;
    }

    return true;
  };

  const filteredFacilities = facilities.filter((facility) => {
    const matchesAge = matchesAgeRange(facility, ageRangeFilter);
    const matchesLang = matchesLanguage(facility, languageFilter);

    return matchesAge && matchesLang;
  });

  if (loading) {
    return <h1>Loading facilities...</h1>;
  }

  if (error) {
    return (
      <p>
        Error:&nbsp;
        {error}
      </p>
    );
  }

  let content;

  if (filterLoading) {
    content = <p>Loading facilities...</p>;
  } else if (!facilitiesView) {
    // Map view
    if (filteredFacilities.length === 0) {
      content = <p>No facilities found for the selected filters.</p>;
    } else {
      content = <MapView facilities={filteredFacilities} />;
    }
  } else if (filteredFacilities.length === 0) {
    content = <p>No facilities found.</p>;
  } else {
    // Table view — results found
    content = (
      <table className="facilities-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Min grade</th>
            <th>Max grade</th>
            <th>Municipality</th>
            <th>Province</th>
          </tr>
        </thead>
        <tbody>
          {filteredFacilities.map((facility) => (
            <tr key={facility.id}>
              <td>{facility.facilityName}</td>
              <td>{facility.facilityType}</td>
              <td>{facility.minGrade}</td>
              <td>{facility.maxGrade}</td>
              <td>{facility.municipalityName}</td>
              <td>{facility.province}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="App">
      <h1>Educational Facilities Landscape</h1>
      <div className="facilities-container">
        <button className="toggle-view-btn" type="button" onClick={toggleView}>
          {facilitiesView ? 'Show Map' : 'Show Facilities'}
        </button>

        <div className="filter-controls">
          <label htmlFor="province-select">Province/territory:&nbsp;</label>
          <select id="province-select" value={selectedProvince} onChange={onProvinceChange}>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <label htmlFor="age-range-select">Facility age range:&nbsp;</label>
          <select
            id="age-range-select"
            value={ageRangeFilter}
            onChange={(e) => setAgeRangeFilter(e.target.value as AgeRangeFilter)}
          >
            <option value="ALL">All age ranges</option>
            <option value="PRIMARY">Primary (up to grade 8)</option>
            <option value="SECONDARY">Secondary (grade 9 and above)</option>
            <option value="K_12">K–12 (kindergarten to grade 12)</option>
          </select>

          <label htmlFor="language-select">Language:&nbsp;</label>
          <select
            id="language-select"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as LanguageFilter)}
          >
            <option value="ALL">All languages</option>
            <option value="ENGLISH">English only</option>
            <option value="FRENCH_IMMERSION">French immersion available</option>
          </select>

          <button type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>

        {content}
      </div>
    </div>
  );
};

export default App;
