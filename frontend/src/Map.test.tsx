/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import MapView, { parseWktPoint } from './Map';

// --- Mocks ---

jest.mock('leaflet.markercluster', () => ({}));

jest.mock('leaflet', () => ({
  map: jest.fn().mockReturnValue({
    setView: jest.fn().mockReturnThis(),
    eachLayer: jest.fn(),
    addLayer: jest.fn().mockReturnThis(),
    removeLayer: jest.fn(),
    fitBounds: jest.fn().mockReturnThis(),
  }),
  tileLayer: jest.fn().mockReturnValue({ addTo: jest.fn() }),
  markerClusterGroup: jest.fn().mockReturnValue({ addLayer: jest.fn() }),
  latLngBounds: jest.fn().mockReturnValue({
    extend: jest.fn(),
    isValid: jest.fn().mockReturnValue(true),
  }),
  circleMarker: jest.fn().mockReturnValue({ bindPopup: jest.fn() }),
}));

// --- Tests ---

describe('MapView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the map container', () => {
    render(<MapView facilities={[]} />);
    const mapElement = screen.getById('map');
    expect(mapElement).toBeInTheDocument();
    expect(mapElement).toHaveClass('map');
  });

  describe('parseWktPoint', () => {
    it('correctly parses a standard WKT POINT string to [lat, lng]', () => {
      // Input: "POINT (Longitude Latitude)"
      const input = 'POINT (-80.5 43.5)';
      // Expected: [Latitude, Longitude]
      const expected = [43.5, -80.5];

      const result = parseWktPoint(input);

      expect(result).toEqual(expected);
    });

    it('returns null for invalid WKT strings', () => {
      expect(parseWktPoint('INVALID TEXT')).toBeNull();
      expect(parseWktPoint('')).toBeNull();
    });
  });
});