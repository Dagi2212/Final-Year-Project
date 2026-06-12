'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plot } from '@/lib/types';

// Fix Leaflet default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PlotMapProps {
  mode: 'interactive' | 'display';
  plots?: Plot[];
  latitude?: number | null;
  longitude?: number | null;
  onChange?: (lat: number, lng: number) => void;
  height?: string;
}

export default function PlotMap({
  mode,
  plots = [],
  latitude,
  longitude,
  onChange,
  height = 'h-64',
}: PlotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const plotMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: latitude && longitude ? [latitude, longitude] : [9.0, 38.7],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (mode === 'interactive') {
      if (latitude && longitude) {
        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onChange?.(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      }

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          const marker = L.marker(e.latlng, { draggable: true }).addTo(map);
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChange?.(pos.lat, pos.lng);
          });
          markerRef.current = marker;
        }
        onChange?.(e.latlng.lat, e.latlng.lng);
      });

      return () => {
        map.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      };
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mode === 'interactive') {
      if (latitude != null && longitude != null) {
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChange?.(pos.lat, pos.lng);
          });
          markerRef.current = marker;
        }
        map.setView([latitude, longitude], Math.max(map.getZoom(), 10));
      } else if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitude, longitude, mode, onChange]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode !== 'display') return;

    plotMarkersRef.current.forEach((m) => m.remove());
    plotMarkersRef.current = [];

    const plotted = plots.filter((p) => {
      if (p.latitude == null || p.longitude == null) return false;
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      return !isNaN(lat) && !isNaN(lng);
    });

    if (plotted.length === 0) {
      map.setView([9.0, 38.7], 7);
      return;
    }

    const bounds = L.latLngBounds([]);
    plotted.forEach((plot) => {
      const lat = Number(plot.latitude);
      const lng = Number(plot.longitude);
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          `<b>${plot.plotName || 'Unnamed'}</b><br/>` +
            `Area: ${plot.areaSqm ?? 'N/A'} sqm<br/>` +
            `Soil: ${plot.soilType || 'N/A'}<br/>` +
            `Lat: ${lat.toFixed(4)}<br/>` +
            `Lng: ${lng.toFixed(4)}`
        );
      plotMarkersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [plots, mode]);

  return <div ref={mapRef} className={`${height} w-full rounded-lg border z-0`} />;
}
