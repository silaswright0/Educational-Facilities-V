/* eslint-disable react/function-component-definition */
// This test file does not declare real React components, but this rule misflags
// some Jest mocks/helpers as components. We keep the rule enabled for app code
// and disable it only here to avoid a false positive.

import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

import App from './App';
import * as facilitiesService from './services/facilitiesService';

// Mock the MapView component so no Leaflet code runs in tests.
// Leaflet and marker clustering depend on browser APIs that jsdom does not support,
// and Map.tsx also expects real `geometry` values. Mocking prevents crashes and
// keeps these tests focused on App behaviour rather than map rendering.
jest.mock('./Map', () => function MockedMapView() {
  return <div data-testid="mock-map">MockMap</div>;
});

// Mock Leaflet's markerClusterGroup for the test environment (jsdom)
jest.mock('leaflet', () => {
  const actualLeaflet = jest.requireActual('leaflet');

  return {
    ...actualLeaflet,
    markerClusterGroup: jest.fn(() => ({
      addLayer: jest.fn(),
      clearLayers: jest.fn(),
    })),
  };
});

// Mock the API service
jest.mock('./services/facilitiesService', () => ({
  __esModule: true,
  default: jest.fn(),
  getFacilitiesByProvince: jest.fn(),
}));

describe('App component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loads facilities and shows UI controls', async () => {
    const mockFacilities = [
      {
        id: 1, facilityName: 'Facility A', facilityType: 'School', municipalityName: 'Toronto', province: 'ON',
      },
      {
        id: 2, facilityName: 'Facility B', facilityType: 'College', municipalityName: 'Montreal', province: 'QC',
      },
    ];

    (facilitiesService.default as jest.Mock).mockResolvedValue(mockFacilities);

    await act(async () => {
      render(<App />);
    });

    // Wait for the toggle button to appear (indicates load finished)
    await waitFor(() => expect(screen.getByRole('button', { name: /show facilities/i })).toBeInTheDocument());

    // Filter controls should be present
    expect(screen.getByLabelText(/Province\/territory/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('filters facilities by selected province and clears filter', async () => {
    const allMockFacilities = [
      {
        id: 1, facilityName: 'Facility A', facilityType: 'School', municipalityName: 'Toronto', province: 'ON',
      },
      {
        id: 2, facilityName: 'Facility B', facilityType: 'College', municipalityName: 'Ottawa', province: 'ON',
      },
      {
        id: 3, facilityName: 'Facility C', facilityType: 'School', municipalityName: 'Vancouver', province: 'BC',
      },
    ];

    const onMockFacilities = [
      {
        id: 1, facilityName: 'Facility A', facilityType: 'School', municipalityName: 'Toronto', province: 'ON',
      },
      {
        id: 2, facilityName: 'Facility B', facilityType: 'College', municipalityName: 'Ottawa', province: 'ON',
      },
    ];

    (facilitiesService.default as jest.Mock).mockImplementation(
      () => Promise.resolve(allMockFacilities),
    );
    (facilitiesService.getFacilitiesByProvince as jest.Mock).mockImplementation(
      () => Promise.resolve(onMockFacilities),
    );

    render(<App />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(facilitiesService.default).toHaveBeenCalledTimes(1);
    });

    // Show facilities view
    const toggle = await screen.findByRole('button', { name: /show facilities/i });
    await userEvent.click(toggle);

    // Wait for table to render with all facilities
    await waitFor(() => {
      const table = screen.getByRole('table');
      const rowgroups = within(table).getAllByRole('rowgroup');
      const tbody = rowgroups.find((rg) => rg.tagName === 'TBODY') ?? rowgroups[1];
      const rowsBefore = within(tbody).getAllByRole('row');
      expect(rowsBefore.length).toBe(3);
    });

    // Select province 'ON' - this should trigger API call
    const select = screen.getByLabelText(/Province\/territory/i) as HTMLSelectElement;
    await act(async () => {
      await userEvent.selectOptions(select, 'ON');
      // Wait a tick for promise to resolve
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });

    // Wait for the API mock to be called with 'ON' and table to update
    await waitFor(() => {
      expect(facilitiesService.getFacilitiesByProvince).toHaveBeenCalledWith('ON');
    });

    await waitFor(() => {
      const table = screen.getByRole('table');
      const rowgroups = within(table).getAllByRole('rowgroup');
      const tbody = rowgroups.find((rg) => rg.tagName === 'TBODY') ?? rowgroups[1];
      const rowsAfter = within(tbody).getAllByRole('row');
      expect(rowsAfter.length).toBe(2);
    });

    // Verify that the displayed province cells are 'ON'
    await waitFor(() => {
      const table = screen.getByRole('table');
      const provinceCells = within(table).getAllByText('ON');
      expect(provinceCells.length).toBe(2);
    });

    // Clear filter and expect to see all rows again
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    await act(async () => {
      await userEvent.click(clearBtn);
      // Wait a tick for promise to resolve
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });

    // Wait for the API mock to be called (getAllFacilities on clear)
    await waitFor(() => {
      expect(facilitiesService.default).toHaveBeenCalledTimes(2); // initial load + clear
    });

    await waitFor(() => {
      const table = screen.getByRole('table');
      const rowgroups = within(table).getAllByRole('rowgroup');
      const tbody = rowgroups.find((rg) => rg.tagName === 'TBODY') ?? rowgroups[1];
      const rowsCleared = within(tbody).getAllByRole('row');
      expect(rowsCleared.length).toBe(3);
    });

    // Verify getAllFacilities was called when clearing
    expect(facilitiesService.default).toHaveBeenCalledTimes(2); // initial load + clear
    expect(facilitiesService.getFacilitiesByProvince).toHaveBeenCalledWith('ON');
  });

  it('handles empty results and shows message', async () => {
    (facilitiesService.default as jest.Mock).mockResolvedValue([]);

    render(<App />);

    // Wait for loading to finish and the toggle button to appear
    const toggle = await screen.findByRole('button', { name: /show facilities/i });
    await userEvent.click(toggle);

    // Expect the empty state message
    await waitFor(() => expect(screen.getByText(/no facilities found/i)).toBeInTheDocument());
  });
});
