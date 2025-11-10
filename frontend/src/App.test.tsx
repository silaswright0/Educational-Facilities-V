import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

import App from './App';

// Mock the API service
jest.mock('./services/facilitiesService', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import getAllFacilities from './services/facilitiesService';

describe('App component', () => {
  it('renders loading state, then facilities table', async () => {
    // Mock data
    const mockFacilities = [
      { id: 1, facilityName: 'Test Facility', facilityType: 'School', municipalityName: 'Toronto', province: 'ON' },
    ];

    (getAllFacilities as jest.Mock).mockResolvedValue(mockFacilities);

    await act(async () => {
      render(<App />);
    });

    // Step 1: check loading state
    expect(screen.getByRole('heading')).toBeInTheDocument();

    // Step 2: wait for button after mock resolves
    await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument());
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders error state if fetch fails', async () => {
    (getAllFacilities as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });
});