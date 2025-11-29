import { Facility } from './types/facility';

// Color palette for the choropleth ranges
export const getChoroplethColor = (ratio: number): string => {
  if (ratio === null || ratio === undefined) return '#888888ff'; // Grey for no data/no schools
  if (ratio <= 0.25) return '#cb6b33ff';
  if (ratio <= 0.50) return '#c2bb5eff';
  if (ratio <= 0.75) return '#7dca50ff';

  return '#0c5603ff';
};

export interface MunicipalityStat {
  frenchCount: number;
  englishCount: number;
  total: number;
  ratio: number; // French / Total
}

export const calculateMunicipalityRatios = (facilities: Facility[]): Record<string, number> => {
  const stats: Record<string, MunicipalityStat> = {};

  facilities.forEach((facility) => {
    // Normalize municipality name to match GeoJSON keys later (trim, uppercase)
    const muniName = facility.censusSubdivisionName?.trim().toUpperCase() || 'UNKNOWN';

    if (!stats[muniName]) {
      stats[muniName] = {
        frenchCount: 0, englishCount: 0, total: 0, ratio: 0,
      };
    }

    // Define what constitutes a "French" school
    // Adjust this logic based on your specific business rules
    const isFrench = facility.languageMinorityStatus
                    || facility.frenchImmersion
                    || facility.earlyImmersion
                    || facility.middleImmersion
                    || facility.lateImmersion;

    if (isFrench) {
      stats[muniName].frenchCount += 1;
    } else {
      stats[muniName].englishCount += 1;
    }

    stats[muniName].total += 1;
  });

  // Calculate final ratios for simple lookup
  const ratioMap: Record<string, number> = {};

  Object.keys(stats).forEach((key) => {
    const s = stats[key];
    // Ratio of French relevant to Total.
    ratioMap[key] = s.total > 0 ? (s.frenchCount / s.total) : 0;
  });

  return ratioMap;
};
