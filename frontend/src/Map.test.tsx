import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapView, { parseWktPoint } from './Map';

// -----------------------------
// parseWktPoint tests
// -----------------------------
describe('parseWktPoint', () => {
  it('correctly parses a standard WKT POINT string', () => {
    const input = 'POINT (-80.5 43.5)';
    const expected = [43.5, -80.5];
    expect(parseWktPoint(input)).toEqual(expected);
  });

  it('returns null for invalid input', () => {
    expect(parseWktPoint('')).toBeNull();
    expect(parseWktPoint('NOT A POINT')).toBeNull();
  });
});

// -----------------------------
// MapView basic tests
// -----------------------------
describe('MapView component (shallow/basic tests)', () => {

  const mockFacilities: any[] = []; // intentionally empty for simplicity

  it('renders without crashing', () => {
    const { container } = render(<MapView facilities={mockFacilities} />);
    expect(container).toBeInTheDocument();
  });

  it('shows loading overlay initially', () => {
    render(<MapView facilities={mockFacilities} />);
    expect(screen.getByText(/loading map/i)).toBeInTheDocument();
  });

  it('renders the choropleth legend by default', () => {
    render(<MapView facilities={mockFacilities} />);

    // Legend container
    const legend = screen.getByRole('region', {
      name: /legend/i,
    });

    expect(legend).toBeInTheDocument();
  });

  it('renders both control buttons', () => {
    render(<MapView facilities={mockFacilities} />);

    expect(
      screen.getByRole('button', {
        name: /show french education choropleth/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /remove french education choropleth/i,
      })
    ).toBeInTheDocument();
  });

  it('clicking "Remove" hides the legend (UI state only)', () => {
    render(<MapView facilities={mockFacilities} />);

    const removeBtn = screen.getByRole('button', {
      name: /remove french education choropleth/i,
    });

    fireEvent.click(removeBtn);

    // After clicking remove, legend should disappear
    const legend = screen.queryByRole('region', {
      name: /legend/i,
    });

    expect(legend).toBeNull();
  });

  it('contains the map element', () => {
    render(<MapView facilities={mockFacilities} />);
    expect(document.getElementById('map')).toBeTruthy();
  });
});
