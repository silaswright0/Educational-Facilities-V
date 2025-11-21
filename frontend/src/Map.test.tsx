/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as L from 'leaflet';
import * as MarkerCluster from 'leaflet.markercluster';

// --- Type Definitions for Mocking ---

// Define the interface for the Facility (imported from the component file implicitly)
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

// Define the shape of the mocked map instance
const mockMap = {
  setView: jest.fn().mockReturnThis(),
  addLayer: jest.fn().mockReturnThis(),
  removeLayer: jest.fn().mockReturnThis(),
  fitBounds: jest.fn().mockReturnThis(),
  eachLayer: jest.fn((callback: (layer: L.Layer & { options?: Partial<{ pane: string }> }) => void) => {
    // Simulate removing existing marker layers before adding new ones
    const mockMarkerLayer: L.Layer & { options?: Partial<{ pane: string }> } = {
      options: { pane: 'markerPane' },
      on: jest.fn(),
      off: jest.fn(),
      fire: jest.fn(),
      clearAllEventListeners: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getEvents: jest.fn(),
      getAttribution: jest.fn(),
      _leaflet_id: 1,
      _eventParents: {},
    };
    callback(mockMarkerLayer);
  }),
} as unknown as L.Map; // Cast to L.Map

// Define the shape of the mocked marker cluster instance
const mockMarkerClusterGroup = {
  addLayer: jest.fn(),
} as unknown as MarkerCluster.MarkerClusterGroup; // Cast to MarkerClusterGroup

// --- Mock Leaflet and MarkerCluster ---

jest.mock('leaflet', () => {
  // Mock the return value of L.circleMarker
  const mockCircleMarker = {
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn(),
    off: jest.fn(),
    fire: jest.fn(),
    clearAllEventListeners: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getEvents: jest.fn(),
    getAttribution: jest.fn(),
    _leaflet_id: 2,
    _eventParents: {},
  } as unknown as L.CircleMarker; // Cast to L.CircleMarker

  // Mock the return value of L.latLngBounds
  const mockLatLngBounds = {
    extend: jest.fn(),
    isValid: jest.fn().mockReturnValue(true), // Assume bounds are valid for testing fitBounds
    getCenter: jest.fn(),
    getSouthWest: jest.fn(),
    getNorthEast: jest.fn(),
    getNorthWest: jest.fn(),
    getSouthEast: jest.fn(),
    contains: jest.fn().mockReturnValue(true),
    equals: jest.fn().mockReturnValue(false),
    toBBoxString: jest.fn(),
    pad: jest.fn().mockReturnThis(),
    isEmpty: jest.fn().mockReturnValue(false),
  } as unknown as L.LatLngBounds; // Cast to L.LatLngBounds

  // The default export 'L' should have 'map', 'tileLayer', 'latLngBounds', 'circleMarker' properties.
  const LMock = {
    map: jest.fn(() => mockMap), // <-- Fix: L.map is now a property on the default export
    tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
    latLngBounds: jest.fn(() => mockLatLngBounds),
    circleMarker: jest.fn(() => mockCircleMarker),
    // Exporting L's types/classes used directly by the component or other mocks
    Map: jest.fn(),
    Layer: jest.fn(),
    // Expose the mock instances for assertion in tests
    __mockMap: mockMap,
  };

  return {
    __esModule: true,
    default: LMock, // L.map is accessed via the default export (L.map)
    ...LMock, // Also export them as named exports just in case (e.g., import { Map } from 'leaflet')
  };
});

// Mock L.markerClusterGroup specifically
jest.mock('leaflet.markercluster', () => ({
  // The named export 'markerClusterGroup' is used directly
  markerClusterGroup: jest.fn(() => mockMarkerClusterGroup),
  // Expose the mock instance for assertion in tests
  __mockMarkerClusterGroup: mockMarkerClusterGroup,
}));

// --- Import Component and Mock Data ---

// Import the component after all mocks
import MapView from './Map';

// Use Partial<Facility> to define mock data, avoiding the need to mock all properties.
// This resolves the `@typescript-eslint/no-explicit-any` warnings (lines 66:8 and 73:8).
const mockFacilities: Partial<Facility>[] = [
  {
    id: 1,
    facilityName: 'School A',
    municipalityName: 'Town 1',
    geometry: 'POINT (-53.9840877 47.7650123)', // Valid WKT
  },
  {
    id: 2,
    facilityName: 'School B',
    municipalityName: 'Town 2',
    geometry: 'INVALID WKT', // Invalid WKT to test the `if (!coords) return;`
  },
];

// --- Access Mocked Objects Directly (Fixes global-require) ---
// By accessing the mocks via the module import object or the mock exports,
// we eliminate the need for global require() calls inside the tests.

// Get the mocked L object and mock instances from the mock exports
const LMock = require('leaflet').default; // eslint-disable-line @typescript-eslint/no-var-requires
const { __mockMap } = require('leaflet'); // eslint-disable-line @typescript-eslint/no-var-requires
const { markerClusterGroup, __mockMarkerClusterGroup } = require('leaflet.markercluster'); // eslint-disable-line @typescript-eslint/no-var-requires


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

  // Test case 2: Map initialization logic runs on first render (Fixes TypeError: L.map is not a function)
  it('initializes the Leaflet map on first render', () => {
    // Resetting mocks might be needed if tests run in parallel or need clean state
    LMock.map.mockClear();
    __mockMap.setView.mockClear();
    LMock.tileLayer.mockClear();

    render(<MapView facilities={[]} />);

    // Check if L.map was called to initialize the map instance
    expect(LMock.map).toHaveBeenCalledWith('map');
    // Check if setView was called (Canada default view)
    expect(__mockMap.setView).toHaveBeenCalledWith([56, -96], 4);
    // Check if L.tileLayer was called
    expect(LMock.tileLayer).toHaveBeenCalled();
  });

  // Test case 3: Markers are created and added to the cluster group
  it('creates markers for valid facilities and adds them to the cluster', () => {
    // Clear mocks before rendering
    LMock.circleMarker.mockClear();
    __mockMarkerClusterGroup.addLayer.mockClear();
    __mockMap.addLayer.mockClear();

    render(<MapView facilities={mockFacilities as Facility[]} />); // Cast needed to satisfy Facility[] prop type

    // Check if markerClusterGroup was initialized
    expect(markerClusterGroup).toHaveBeenCalled();

    // Check if L.circleMarker was called only for the valid facility (Facility A)
    // Facility A: geometry 'POINT (-53.9840877 47.7650123)' -> [47.7650123, -53.9840877]
    expect(LMock.circleMarker).toHaveBeenCalledTimes(1);
    expect(LMock.circleMarker).toHaveBeenCalledWith(
      [47.7650123, -53.9840877],
      expect.anything(),
    );

    // Check if the mock marker was added to the cluster group
    expect(__mockMarkerClusterGroup.addLayer).toHaveBeenCalledTimes(1);

    // Check if the marker cluster group was added to the map
    expect(__mockMap.addLayer).toHaveBeenCalledWith(__mockMarkerClusterGroup);
  });

  // Test case 4: Map bounds are fit to the markers (Fixes the failure due to L.map not being a function)
  it('calls map.fitBounds when facilities are present', () => {
    // Clear mocks before rendering
    __mockMap.fitBounds.mockClear();

    render(<MapView facilities={mockFacilities as Facility[]} />); // Cast needed to satisfy Facility[] prop type

    // fitBounds should be called when bounds.isValid() is true (mocked above)
    expect(__mockMap.fitBounds).toHaveBeenCalledWith(
      expect.anything(), // L.latLngBounds instance
      { padding: [50, 50] },
    );
  });
});