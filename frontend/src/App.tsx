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

const App: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilitiesView, setShowFacilities] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    getAllFacilities()
      .then((data) => setFacilities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleView = (): void => {
    setShowFacilities((prev) => !prev);
  };

  /* useEffect(() => {
    // cheat to refresh page to ensure points appear
    setTimeout(() => {
      if (!sessionStorage.getItem('reloaded')) {
        sessionStorage.setItem('reloaded', 'true');
        window.location.reload();
      }
    }, 3000);
  }, []); */

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

    if (provinceCode === '') {
      // Load all facilities
      setFilterLoading(true);
      getAllFacilities()
        .then((data) => setFacilities(data))
        .catch((err) => setError(err.message))
        .finally(() => setFilterLoading(false));
    } else {
      // Load facilities for selected province
      setFilterLoading(true);
      getFacilitiesByProvince(provinceCode)
        .then((data) => setFacilities(data))
        .catch((err) => setError(err.message))
        .finally(() => setFilterLoading(false));
    }
  };

  const clearProvinceFilter = (): void => {
    setSelectedProvince('');
    setFilterLoading(true);
    getAllFacilities()
      .then((data) => setFacilities(data))
      .catch((err) => setError(err.message))
      .finally(() => setFilterLoading(false));
  };

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

  if (!facilitiesView) {
    content = <MapView facilities={facilities} />;
  } else if (filterLoading) {
    content = <p>Loading facilities...</p>;
  } else if (facilities.length === 0) {
    content = <p>No facilities found.</p>;
  } else {
    content = (
      <div>
        <div className="filter-controls">
          <label htmlFor="province-select">Filter by province/territory:&nbsp;</label>
          <select id="province-select" value={selectedProvince} onChange={onProvinceChange}>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={clearProvinceFilter}>
            Clear
          </button>
        </div>
        <table className="facilities-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Municipality</th>
              <th>Province</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id}>
                <td>{facility.facilityName}</td>
                <td>{facility.facilityType}</td>
                <td>{facility.municipalityName}</td>
                <td>{facility.province}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Educational Facilities Landscape</h1>
      <div className="facilities-container">

        <button type="button" onClick={toggleView}>
          {facilitiesView ? 'Show Map' : 'Show Facilities'}
        </button>

        <br />

        {content}
      </div>
    </div>
  );
};

export default App;
