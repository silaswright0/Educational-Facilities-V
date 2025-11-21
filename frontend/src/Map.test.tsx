/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Leaflet and MarkerCluster
// This is crucial because Leaflet relies on DOM APIs not present in Jest by default.
const mockMap = {
  setView: jest.fn().mockReturnThis(),
  addLayer: jest.fn().mockReturnThis(),
  removeLayer: jest.fn().mockReturnThis(),
  fitBounds: jest.fn().mockReturnThis(),
  eachLayer: jest.fn((callback) => {
    // Simulate removing existing marker layers before adding new ones
    // The component logic checks for layer options/pane, so we simulate a layer that matches.
    const mockMarkerLayer = { options: { pane: 'markerPane' } };
    callback(mockMarkerLayer);
  }),
};

const mockMarkerClusterGroup = {
  addLayer: jest.fn(),
};

// Mock the entire 'leaflet' and 'leaflet.markercluster' modules
jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    map: jest.fn(() => mockMap),
    tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
    latLngBounds: jest.fn(() => ({
      extend: jest.fn(),
      isValid: jest.fn().mockReturnValue(true), // Assume bounds are valid for testing fitBounds
    })),
    // Mock the marker types used in the component
    circleMarker: jest.fn(() => ({
      bindPopup: jest.fn().mockReturnThis(),
    })),
  },
  // Re-export required Leaflet constants and types used directly (e.g., L.Layer)
  Map: jest.fn(),
  Layer: jest.fn(),
  latLngBounds: jest.fn(() => ({
    extend: jest.fn(),
    isValid: jest.fn().mockReturnValue(true),
  })),
}));

// Mock L.markerClusterGroup specifically
jest.mock('leaflet.markercluster', () => ({
  markerClusterGroup: jest.fn(() => mockMarkerClusterGroup),
}));

// Import the component after all mocks
import MapView from '../MapView';

const mockFacilities = [
  {
    id: 1,
    facilityName: 'School A',
    municipalityName: 'Town 1',
    geometry: 'POINT (-53.9840877 47.7650123)', // Valid WKT
    // ... rest of the required Facility properties (omitted for brevity in mock)
  } as any,
  {
    id: 2,
    facilityName: 'School B',
    municipalityName: 'Town 2',
    geometry: 'INVALID WKT', // Invalid WKT to test the `if (!coords) return;`
    // ... rest of the required Facility properties (omitted for brevity in mock)
  } as any,
];

// Grouping tests for the component
describe('MapView', () => {
  // Test case 1: Component renders correctly and initializes the map
  it('renders the map container div', () => {
    render(<MapView facilities={[]} />);

    // Check if the div with id="map" and className="map" is present
    const mapElement = screen.getByRole('generic', { name: /map/i });
    expect(mapElement).toBeInTheDocument();
    expect(mapElement).toHaveAttribute('id', 'map');
    expect(mapElement).toHaveClass('map');
  });

  // Test case 2: Map initialization logic runs on first render
  it('initializes the Leaflet map on first render', () => {
    // Get the mocked L object to check call counts
    const L = require('leaflet').default; // eslint-disable-line @typescript-eslint/no-var-requires

    render(<MapView facilities={[]} />);

    // Check if L.map was called to initialize the map instance
    expect(L.map).toHaveBeenCalledWith('map');
    // Check if setView was called (Canada default view)
    expect(mockMap.setView).toHaveBeenCalledWith([56, -96], 4);
    // Check if L.tileLayer was called
    expect(L.tileLayer).toHaveBeenCalled();
  });

  // Test case 3: Markers are created and added to the cluster group
  it('creates markers for valid facilities and adds them to the cluster', () => {
    const L = require('leaflet').default; // eslint-disable-line @typescript-eslint/no-var-requires
    const { markerClusterGroup } = require('leaflet.markercluster'); // eslint-disable-line @typescript-eslint/no-var-requires

    render(<MapView facilities={mockFacilities} />);

    // Check if markerClusterGroup was initialized
    expect(markerClusterGroup).toHaveBeenCalled();

    // Check if L.circleMarker was called only for the valid facility (Facility A)
    // Facility A: geometry 'POINT (-53.9840877 47.7650123)' -> [47.7650123, -53.9840877]
    expect(L.circleMarker).toHaveBeenCalledTimes(1);
    expect(L.circleMarker).toHaveBeenCalledWith(
      [47.7650123, -53.9840877],
      expect.anything(),
    );

    // Check if the mock marker was added to the cluster group
    expect(mockMarkerClusterGroup.addLayer).toHaveBeenCalledTimes(1);

    // Check if the marker cluster group was added to the map
    expect(mockMap.addLayer).toHaveBeenCalledWith(mockMarkerClusterGroup);
  });

  // Test case 4: Map bounds are fit to the markers
  it('calls map.fitBounds when facilities are present', () => {
    render(<MapView facilities={mockFacilities} />);

    // fitBounds should be called when bounds.isValid() is true (mocked above)
    expect(mockMap.fitBounds).toHaveBeenCalledWith(
      expect.anything(), // L.latLngBounds instance
      { padding: [50, 50] },
    );
  });
});