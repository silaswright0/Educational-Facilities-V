/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import MapView from './Map'; // Adjust path if necessary

// --- 1. Define Types locally to avoid importing complex library types ---

// A partial mock of the Facility interface for testing purposes
interface MockFacility {
  id: number;
  facilityName: string;
  municipalityName: string;
  geometry: string;
}

// --- 2. Setup Mocks ---

// Mock 'leaflet.markercluster' to prevent it from trying to modify the real Leaflet
jest.mock('leaflet.markercluster', () => ({}));

// Mock 'leaflet' completely
jest.mock('leaflet', () => {
  // Create the methods that the Map object needs
  const mapMethods = {
    setView: jest.fn().mockReturnThis(),
    addLayer: jest.fn().mockReturnThis(),
    removeLayer: jest.fn().mockReturnThis(),
    fitBounds: jest.fn().mockReturnThis(),
    eachLayer: jest.fn(),
  };

  // Create the mock for the TileLayer
  const tileLayerMock = {
    addTo: jest.fn(),
  };

  // Create the mock for the MarkerClusterGroup
  const clusterGroupMock = {
    addLayer: jest.fn(),
  };

  // Create the mock for CircleMarker
  const circleMarkerMock = {
    bindPopup: jest.fn().mockReturnThis(),
  };

  return {
    __esModule: true,
    // Default export simulates the global 'L' object
    default: {
      map: jest.fn(() => mapMethods),
      tileLayer: jest.fn(() => tileLayerMock),
      latLngBounds: jest.fn(() => ({
        extend: jest.fn(),
        isValid: jest.fn().mockReturnValue(true),
      })),
      // Crucial Fix: We define markerClusterGroup directly on L here
      markerClusterGroup: jest.fn(() => clusterGroupMock),
      circleMarker: jest.fn(() => circleMarkerMock),
      // Mock the internal classes if referenced directly
      Map: jest.fn(),
      Layer: jest.fn(),
    },
  };
});

// --- 3. Test Data ---

const mockFacilities: MockFacility[] = [
  {
    id: 1,
    facilityName: 'Test Facility',
    municipalityName: 'Test City',
    // Simple point for parsing test
    geometry: 'POINT (-80.0 43.0)',
  },
];

// --- 4. The Tests ---

describe('MapView Component', () => {
  // Retrieve the mocked L object to check if functions are called
  // We use 'import' here inside the test file context which is standard
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require('leaflet').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the map container without crashing', () => {
    // Cast strict type to relax props for testing
    render(<MapView facilities={[]} />);

    const mapDiv = screen.getByRole('generic', { name: /map/i });
    expect(mapDiv).toBeInTheDocument();
    expect(mapDiv).toHaveClass('map');
  });

  it('initializes the map with Canada coordinates', () => {
    render(<MapView facilities={[]} />);

    // Verify L.map was called with the 'map' ID
    expect(L.map).toHaveBeenCalledWith('map');

    // Verify the view was set to Canada (coords from your component)
    // Note: We access the results of the mock call to check chaining
    const mapInstance = L.map.mock.results[0].value;
    expect(mapInstance.setView).toHaveBeenCalledWith([56, -96], 4);
  });

  it('adds a marker cluster group to the map', () => {
    // Cast mock data to 'any' or the full type to satisfy TS
    render(<MapView facilities={mockFacilities as any} />);

    // Verify markerClusterGroup was created
    expect(L.markerClusterGroup).toHaveBeenCalled();

    // Verify the cluster group was added to the map
    const mapInstance = L.map.mock.results[0].value;
    expect(mapInstance.addLayer).toHaveBeenCalled();
  });

  it('parses WKT geometry and creates a circle marker', () => {
    render(<MapView facilities={mockFacilities as any} />);

    // Our WKT is 'POINT (-80.0 43.0)' -> Lat: 43.0, Lng: -80.0
    // Leaflet uses [lat, lng]
    expect(L.circleMarker).toHaveBeenCalledWith(
      [43.0, -80.0],
      expect.anything() // Ignore the options object for this simple test
    );
  });
});