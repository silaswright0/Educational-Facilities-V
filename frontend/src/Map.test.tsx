/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as L from 'leaflet';

// --- Type Definitions ---

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

// --- Mock Leaflet and MarkerCluster ---

// We define mocks inside the factory to ensure proper scope and hoisting.
jest.mock('leaflet', () => {
  // 1. Define the Mock Map Instance
  const mapInstance = {
    setView: jest.fn().mockReturnThis(),
    addLayer: jest.fn().mockReturnThis(),
    removeLayer: jest.fn().mockReturnThis(),
    fitBounds: jest.fn().mockReturnThis(),
    eachLayer: jest.fn(
      (
        callback: (
          layer: L.Layer & { options?: Partial<{ pane: string }> }
        ) => void
      ) => {
        const mockMarkerLayer = {
          options: { pane: 'markerPane' },
          _leaflet_id: 1,
        } as unknown as L.Layer;
        callback(mockMarkerLayer);
      }
    ),
  };

  // 2. Define Mock CircleMarker
  const circleMarkerInstance = {
    bindPopup: jest.fn().mockReturnThis(),
    _leaflet_id: 2,
  };

  // 3. Define Mock LatLngBounds
  const latLngBoundsInstance = {
    extend: jest.fn(),
    isValid: jest.fn().mockReturnValue(true),
    pad: jest.fn().mockReturnThis(),
  };

  // 4. Create the Mock Object
  // We define 'map' as a jest function that returns mapInstance.
  const LMock = {
    map: jest.fn(() => mapInstance),
    tileLayer: jest.fn(() => ({ addTo: jest.fn() })),
    latLngBounds: jest.fn(() => latLngBoundsInstance),
    circleMarker: jest.fn(() => circleMarkerInstance),
    Map: jest.fn(),
    Layer: jest.fn(),
    // Expose internals for test assertions
    __mockMap: mapInstance,
    __mockCircleMarker: circleMarkerInstance,
  };

  return {
    __esModule: true,
    default: LMock,
    ...LMock, // Spread named exports so 'import * as L' works
  };
});

jest.mock('leaflet.markercluster', () => {
  const clusterInstance = {
    addLayer: jest.fn(),
  };

  return {
    markerClusterGroup: jest.fn(() => clusterInstance),
    __mockMarkerClusterGroup: clusterInstance,
  };
});

// --- Import Component ---
import MapView from './Map';

// --- Access Mocks ---

// Retrieve the mocked instances using require to access the specific factory objects
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LeafletMock = require('leaflet').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __mockMap } = require('leaflet');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { markerClusterGroup, __mockMarkerClusterGroup } = require('leaflet.markercluster');

const mockFacilities: Partial<Facility>[] = [
  {
    id: 1,
    facilityName: 'School A',
    municipalityName: 'Town 1',
    geometry: 'POINT (-53.9840877 47.7650123)',
  },
  {
    id: 2,
    facilityName: 'School B',
    municipalityName: 'Town 2',
    geometry: 'INVALID WKT',
  },
];

// --- Tests ---

describe('MapView', () => {
  // Fix for "Cannot read properties of undefined (reading 'setView')"
  // This ensures L.map() returns the mock object even if Jest resets mocks between tests.
  beforeEach(() => {
    LeafletMock.map.mockReturnValue(__mockMap);
    __mockMap.setView.mockReturnThis(); // Ensure chaining works
  });

  it('renders the map container div', () => {
    render(<MapView facilities={[]} />);
    const mapElement = screen.getByRole('generic', { name: /map/i });
    expect(mapElement).toBeInTheDocument();
    expect(mapElement).toHaveAttribute('id', 'map');
    expect(mapElement).toHaveClass('map');
  });

  it('initializes the Leaflet map on first render', () => {
    // Clear specific calls without resetting the implementation
    LeafletMock.map.mockClear();
    __mockMap.setView.mockClear();
    LeafletMock.tileLayer.mockClear();

    render(<MapView facilities={[]} />);

    expect(LeafletMock.map).toHaveBeenCalledWith('map');
    expect(__mockMap.setView).toHaveBeenCalledWith([56, -96], 4);
    expect(LeafletMock.tileLayer).toHaveBeenCalled();
  });

  it('creates markers for valid facilities and adds them to the cluster', () => {
    LeafletMock.circleMarker.mockClear();
    __mockMarkerClusterGroup.addLayer.mockClear();
    __mockMap.addLayer.mockClear();

    render(
      <MapView facilities={mockFacilities as Facility[]} />
    );

    expect(markerClusterGroup).toHaveBeenCalled();

    // Facility A coords: [47.7650123, -53.9840877]
    expect(LeafletMock.circleMarker).toHaveBeenCalledTimes(1);
    expect(LeafletMock.circleMarker).toHaveBeenCalledWith(
      [47.7650123, -53.9840877],
      expect.anything()
    );

    expect(__mockMarkerClusterGroup.addLayer).toHaveBeenCalledTimes(1);
    expect(__mockMap.addLayer).toHaveBeenCalledWith(__mockMarkerClusterGroup);
  });

  it('calls map.fitBounds when facilities are present', () => {
    __mockMap.fitBounds.mockClear();

    render(
      <MapView facilities={mockFacilities as Facility[]} />
    );

    expect(__mockMap.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      { padding: [50, 50] }
    );
  });
});