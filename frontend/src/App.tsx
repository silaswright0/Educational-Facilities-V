import './App.css';

import { useEffect, useState } from 'react';

import getAllFacilities from './services/facilitiesService';

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

  useEffect(() => {
    getAllFacilities()
      .then((data) => setFacilities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleView = (): void => {
    setShowFacilities((prev) => !prev);
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
    content = <p>wow map :)</p>;
  } else if (facilities.length === 0) {
    content = <p>No facilities found.</p>;
  } else {
    content = (
      <table>
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
    );
  }

  return (
    <div className="App">
      <h1>Educational Facilities Landscape</h1>
      <button type="button" onClick={toggleView}>
        {facilitiesView ? 'Show Map' : 'Show Facilities'}
      </button>
      {content}
    </div>
  );
};

export default App;
