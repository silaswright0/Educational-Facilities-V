import { useEffect, useRef, useState } from 'react';

import './Map.css';

import type { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { calculateMunicipalityRatios, getChoroplethColor } from './choroplethHelper';
import getMunicipalities from './services/municipalitiesService';
import { Facility } from './types/facility';

interface MapViewProps {
  facilities: Facility[];
}

export function parseWktPoint(wkt: string): [number, number] | null {
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!match) return null;

  const lng = parseFloat(match[1]);
  const lat = parseFloat(match[2]);

  return [lat, lng];
}

const MapView: React.FC<MapViewProps> = ({ facilities }) => {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const choroplethRef = useRef<L.GeoJSON<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    getMunicipalities()
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Error loading geojson:', err));
  }, []);

  useEffect(() => {
    if (!geojsonData) return;

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([56, -96], 4);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remove old markers
    map.eachLayer((layer: L.Layer) => {
      const layerWithMaybePane = layer as any;
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

    // Prepare choropleth data
    const stats = calculateMunicipalityRatios(facilities);

    geojsonData.features.forEach((f) => {
      const feature = f.properties as any;
      const name = feature.CSDNAME?.trim().toUpperCase();
      feature.ratio = stats[name] ?? null;
    });

    const style = (feature: any) => ({
      fillColor: getChoroplethColor(feature.properties.ratio),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    });

    // Remove old choropleth before drawing a new one
    if (choroplethRef.current) {
      map.removeLayer(choroplethRef.current);
    }

    choroplethRef.current = L.geoJSON(geojsonData, { style }).addTo(map);
    setIsLoading(false);
  }, [facilities, geojsonData]);

  // Buttons can now call these!
  const showChoropleth = () => {
    if (!mapRef.current || !geojsonData) return;

    if (choroplethRef.current) {
      mapRef.current.removeLayer(choroplethRef.current);
    }

    choroplethRef.current = L.geoJSON(geojsonData, {
      style: (feature: any) => ({
        fillColor: getChoroplethColor(feature.properties.ratio),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
      }),
    }).addTo(mapRef.current);
    setShowLegend(true);
  };

  const removeChoropleth = () => {
    if (mapRef.current && choroplethRef.current) {
      mapRef.current.removeLayer(choroplethRef.current);
      choroplethRef.current = null;
    }

    setShowLegend(false);
  };

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          Loading map…
        </div>
      )}
      <div className="map-control-row">
        <button type="button" onClick={showChoropleth}>Show French Education Choropleth</button>
        <button type="button" onClick={removeChoropleth}>Remove French Education Choropleth</button>
      </div>
      <br />
      <div className="map-row">
        <div id="map" className="map" />
        {showLegend && (
          <div className="choropleth-legend" role="region" aria-label="legend">
            <ul className="choropleth-legend__list" aria-hidden="false">
              <li className="choropleth-legend__item">
                <span className="choropleth-legend__swatch_0" />
                <span className="choropleth-legend__label">&gt; 75% — Predominantly French</span>
              </li>

              <li className="choropleth-legend__item">
                <span className="choropleth-legend__swatch_1" />
                <span className="choropleth-legend__label">50% - 75% — Strong French presence</span>
              </li>

              <li className="choropleth-legend__item">
                <span className="choropleth-legend__swatch_2" />
                <span className="choropleth-legend__label">25% - 50% — Mixed</span>
              </li>

              <li className="choropleth-legend__item">
                <span className="choropleth-legend__swatch_3" />
                <span className="choropleth-legend__label">0% - 25% — Predominantly English</span>
              </li>

              <li className="choropleth-legend__item">
                <span className="choropleth-legend__swatch_4" />
                <span className="choropleth-legend__label">No data / no schools</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default MapView;
