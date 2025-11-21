import { useEffect, useRef } from 'react';

import './Map.css';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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

interface MapViewProps {
  facilities: Facility[];
}
function parseWktPoint(wkt: string): [number, number] | null {
  // Example input: "POINT (-53.9840877 47.7650123)"
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!match) return null;

  const lng = parseFloat(match[1]);
  const lat = parseFloat(match[2]);

  return [lat, lng]; // Leaflet uses lat, lng order
}

const MapView: React.FC<MapViewProps> = ({ facilities }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([56, -96], 4); // Canada view

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    map.eachLayer((layer: L.Layer) => {
      const layerWithMaybePane = layer as L.Layer & {
        options?: Partial<{ pane: string }>;
      };

      if (layerWithMaybePane.options?.pane === 'markerPane') {
        map.removeLayer(layer);
      }
    });

    const markerCluster = L.markerClusterGroup();
    const bounds = L.latLngBounds([]);

    facilities.forEach((facility) => {
      const coords = parseWktPoint(facility.geometry);
      if (!coords) return;

      const [lat, lng] = coords;

      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        weight: 1,
        fillOpacity: 0.9,
      }).bindPopup(
        `<b>${facility.facilityName}</b><br>${facility.municipalityName}`,
      );

      markerCluster.addLayer(marker);

      bounds.extend([lat, lng]);
    });

    map.addLayer(markerCluster);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Do NOT remove map on rerenders
    };
  }, [facilities]);

  return <div id="map" className="map" />;
};

export default MapView;
