import { parseWktPoint } from './Map';

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
