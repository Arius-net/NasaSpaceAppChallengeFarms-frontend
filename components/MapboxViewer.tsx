"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Compass, Layers, MapPin } from "lucide-react";
import type { ClimateTelemetry } from "@/services/api";

const WORKER_CDN_URL = "https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl-csp-worker.js";
const maplibreConfig = (
  "default" in maplibregl && maplibregl.default ? maplibregl.default : maplibregl
) as { workerUrl?: string; setWorkerUrl?: (url: string) => void };
if (typeof maplibreConfig.setWorkerUrl === "function") {
  maplibreConfig.setWorkerUrl(WORKER_CDN_URL);
}
try {
  maplibreConfig.workerUrl = WORKER_CDN_URL;
} catch {}

export interface MapboxViewerProps {
  parcelId?: string;
  parcelName?: string;
  coordinates?: { lat: number; lng: number };
  telemetry?: ClimateTelemetry;
  semaforoColor?: string;
  onSelectCoordinate?: (lat: number, lon: number) => void;
}

const PRESET_LOCATIONS = [
  { name: "Villaflores", region: "Frailesca", lat: 16.2333, lon: -93.2667 },
  { name: "La Concordia", region: "Frailesca", lat: 16.1165, lon: -92.6885 },
  { name: "Tapachula", region: "Sur de Chiapas", lat: 14.9039, lon: -92.2574 },
  { name: "Palenque", region: "Norte de Chiapas", lat: 17.5095, lon: -91.9829 },
  { name: "Querétaro", region: "Centro de México", lat: 20.5888, lon: -100.3899 },
  { name: "Ciudad de México", region: "Centro de México", lat: 19.4326, lon: -99.1332 },
  { name: "Monterrey", region: "Norte de México", lat: 25.6866, lon: -100.3161 },
  { name: "Mérida", region: "Península de Yucatán", lat: 20.9674, lon: -89.5926 },
];

export default function MapboxViewer({
  parcelId = "FRA-01",
  parcelName = "Punto seleccionado",
  coordinates = { lat: 16.2333, lng: -93.2667 },
  semaforoColor = "signal",
  onSelectCoordinate,
}: MapboxViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const callbackRef = useRef(onSelectCoordinate);
  const [mapStyleMode, setMapStyleMode] = useState<"satellite" | "topo">("satellite");

  useEffect(() => {
    callbackRef.current = onSelectCoordinate;
  }, [onSelectCoordinate]);

  const getPinHex = (colorCode: string) => {
    if (colorCode === "signal") return "#176b4d";
    if (colorCode === "warn") return "#B45309";
    if (colorCode === "alert") return "#9B2C2C";
    return "#176b4d";
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "© Esri World Imagery • NASA POWER Earth Observation",
          },
          topo: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap • CARTO",
          },
        },
        layers: [
          {
            id: "topo-layer",
            type: "raster",
            source: "topo",
            layout: { visibility: "none" },
          },
          {
            id: "satellite-layer",
            type: "raster",
            source: "satellite",
            layout: { visibility: "visible" },
          },
        ],
      },
      center: [coordinates.lng, coordinates.lat],
      zoom: 9.2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const marker = new maplibregl.Marker({
      color: getPinHex(semaforoColor),
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map);

    markerRef.current = marker;

    map.on("click", (e) => {
      const clickedLat = Number(e.lngLat.lat.toFixed(4));
      const clickedLon = Number(e.lngLat.lng.toFixed(4));
      if (markerRef.current) {
        markerRef.current.setLngLat([clickedLon, clickedLat]);
      }
      callbackRef.current?.(clickedLat, clickedLon);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.remove();
    }
    const newMarker = new maplibregl.Marker({
      color: getPinHex(semaforoColor),
    })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(mapRef.current);

    markerRef.current = newMarker;

    const currentZoom = mapRef.current.getZoom();
    mapRef.current.flyTo({
      center: [coordinates.lng, coordinates.lat],
      zoom: currentZoom < 8.5 ? 9.5 : currentZoom,
      duration: 750,
    });
  }, [coordinates.lat, coordinates.lng, semaforoColor]);

  const handleCenterPoint = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [coordinates.lng, coordinates.lat],
      zoom: 9.5,
      duration: 800,
    });
  };

  const toggleMapLayer = (mode: "satellite" | "topo") => {
    setMapStyleMode(mode);
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer("satellite-layer") && map.getLayer("topo-layer")) {
      map.setLayoutProperty(
        "satellite-layer",
        "visibility",
        mode === "satellite" ? "visible" : "none"
      );
      map.setLayoutProperty(
        "topo-layer",
        "visibility",
        mode === "topo" ? "visible" : "none"
      );
    }
  };

  return (
    <section className="rounded-xl border border-[#dce4dc] bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-[#dce4dc] flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#176b4d]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[#17231c]">
              Explorador Satelital • {parcelName} ({parcelId})
            </h2>
          </div>
          <p className="text-xs text-[#647269] mt-0.5">
            Selecciona cualquier punto en el mapa para actualizar las coordenadas de la parcela.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCenterPoint}
            className="px-2.5 py-1.5 rounded-lg bg-[#e8f1df] hover:bg-[#d7edb4] text-[#176b4d] font-mono text-xs font-bold flex items-center gap-1.5 transition border border-[#cbd9ce]"
          >
            Centrar punto
          </button>

          <div className="flex items-center gap-1 bg-[#f7f8f3] p-1 rounded-lg border border-[#dce4dc] text-xs font-mono">
            <button
              type="button"
              onClick={() => toggleMapLayer("satellite")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                mapStyleMode === "satellite"
                  ? "bg-[#176b4d] text-white font-bold"
                  : "text-[#647269] hover:text-[#17231c]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Satélite
            </button>
            <button
              type="button"
              onClick={() => toggleMapLayer("topo")}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                mapStyleMode === "topo"
                  ? "bg-[#176b4d] text-white font-bold"
                  : "text-[#647269] hover:text-[#17231c]"
              }`}
            >
              Mapa Base
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-[#dce4dc] bg-[#f7f8f3] px-4 py-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#647269]">
          Puntos de consulta
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_LOCATIONS.map((location) => {
            const isActive =
              Math.abs(coordinates.lat - location.lat) < 0.01 &&
              Math.abs(coordinates.lng - location.lon) < 0.01;

            return (
              <button
                key={`${location.name}-${location.region}`}
                type="button"
                title={location.region}
                onClick={() => onSelectCoordinate?.(location.lat, location.lon)}
                className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
                  isActive
                    ? "border-[#176b4d] bg-[#176b4d] font-bold text-white"
                    : "border-[#dce4dc] bg-white text-[#17231c] hover:border-[#176b4d]"
                }`}
              >
                {location.name} · {location.region}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative w-full h-96 min-h-[420px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto bg-[#17231c]/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg border border-white/15 font-mono text-xs flex items-center gap-2 shadow">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>{parcelName}</strong> • ({coordinates.lat.toFixed(4)}°,{" "}
              {coordinates.lng.toFixed(4)}°)
            </span>
          </div>

          <div className="pointer-events-auto bg-[#0e4935]/90 backdrop-blur-sm text-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-400/40 font-mono text-[11px] flex items-center gap-2 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            NASA POWER API (Cobertura en Vivo)
          </div>
        </div>
      </div>
    </section>
  );
}
