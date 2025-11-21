import React from 'react';

import { render } from '@testing-library/react';

import MapView from './Map';

import * as L from 'leaflet';

// ---- Mock markercluster plugin ----
jest.mock('leaflet.markercluster', () => {
  return jest.fn(() => ({
    addLayer: jest.fn(),
  }));
});

// ---- Import helper for tests ----
import {
  // @ts-ignore testing internal function
  parseWktPoint
} from './Map';

// ---- parseWktPoint tests ----
describe('parseWktPoint', () => {
  test('parses valid WKT', () => {
    expect(parseWktPoint('POINT (-53 47)')).toEqual([47, -53]);
  });

  test('returns null for invalid input', () => {
    expect(parseWktPoint('INVALID')).toBeNull();
  });
});

// ---- Leaflet mocks ----

const mockSetView = jest.fn().mockReturnThis();
const mockAddLayer = jest.fn().mockReturnThis();
const mockEachLayer = jest.fn();
const mockInvalidateSize = jest.fn();
const mockFitBounds = jest.fn();

// Persistent mock bounds object
const boundsMock = {
  extend: jest.fn(),
  isValid: jest.fn(() => false),
} as unknown as L.LatLngBounds;

// Mock L.map
jest.spyOn(L, 'map').mockImplementation(() => {
  return {
    setView: mockSetView,
    addLayer: mockAddLayer,
    eachLayer: mockEachLayer,
    invalidateSize: mockInvalidateSize,
    fitBounds: mockFitBounds,
  } as unknown as L.Map;
});

// Mock L.tileLayer
jest.spyOn(L, 'tileLayer').mockImplementation(() => {
  return {
    addTo: jest.fn(),
  } as unknown as L.TileLayer;
});

// Mock L.latLngBounds
jest.spyOn(L, 'latLngBounds').mockImplementation(() => boundsMock);

describe('MapView', () => {
  test('renders map container', () => {
    const facilities: any[] = [];
    const { container } = render(<MapView facilities={facilities} />);
    expect(container.querySelector('.map')).toBeInTheDocument();
  });

  test('initializes Leaflet map', () => {
    render(<MapView facilities={[]} />);
    expect(L.map).toHaveBeenCalledTimes(1);
    expect(mockSetView).toHaveBeenCalledWith([56, -96], 4);
  });

  test('creates markers for valid geometry', () => {
    const facilities = [
      {
        id: 1,
        facilityName: 'Test',
        authorityName: '',
        address: '',
        unit: '',
        postalCode: '',
        municipalityName: 'Town',
        sourceId: '',
        minGrade: '',
        maxGrade: '',
        facilityType: '',
        province: '',
        censusDivisionName: '',
        censusDivisionId: '',
        geometry: 'POINT (-50 60)',
        languageMinorityStatus: false,
        frenchImmersion: false,
        earlyImmersion: false,
        middleImmersion: false,
        lateImmersion: false,
      },
    ];

    render(<MapView facilities={facilities} />);

    expect(boundsMock.extend).toHaveBeenCalled();
  });

  test('skips invalid geometry', () => {
    const facilities = [
      {
        id: 1,
        facilityName: 'Bad',
        authorityName: '',
        address: '',
        unit: '',
        postalCode: '',
        municipalityName: '',
        sourceId: '',
        minGrade: '',
        maxGrade: '',
        facilityType: '',
        province: '',
        censusDivisionName: '',
        censusDivisionId: '',
        geometry: 'INVALID',
        languageMinorityStatus: false,
        frenchImmersion: false,
        earlyImmersion: false,
        middleImmersion: false,
        lateImmersion: false,
      },
    ];

    render(<MapView facilities={facilities} />);

    expect(boundsMock.extend).not.toHaveBeenCalled();
  });

  test('Leaflet map exists on page after render', () => {
    const { container } = render(<MapView facilities={[]} />);

    // Leaflet will attach .leaflet-container inside the map div
    const mapEl = container.querySelector('.leaflet-container');

    expect(mapEl).toBeInTheDocument();
  });
});
