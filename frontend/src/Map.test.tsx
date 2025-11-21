/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as L from 'leaflet';
import MapView from './Map';

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

  it('parses WKT correctly and places a marker at [lat, lng]', () => {
    // We test the parsing logic by checking if L.circleMarker received the correct coordinates.
    // Input: "POINT (Longitude Latitude)" -> Leaflet expects [Latitude, Longitude]
    const mockData = [
      {
        id: 1,
        facilityName: 'Test',
        municipalityName: 'City',
        geometry: 'POINT (-80.5 43.5)',
      },
    ];

    render(<MapView facilities={mockData as any} />);

    // Verify parsing: -80.5 (Lng) and 43.5 (Lat) should flip to [43.5, -80.5]
    expect(L.circleMarker).toHaveBeenCalledWith([43.5, -80.5], expect.anything());
  });
});