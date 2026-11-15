"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Compass, Globe2, Layers, MapPin, Navigation } from "lucide-react";
import type { ClimateTelemetry } from "@/services/api";

export interface MapboxViewerProps {
  parcelId?: string;
  parcelName?: string;
  coordinates?: { lat: number; lng: number };
  telemetry?: ClimateTelemetry;
  semaforoColor?: string;
  apiBaseUrl?: string;
  onSelectCoordinate?: (lat: number, lon: number) => void;
}

const FRAILESCA_LOCATIONS = [
  { name: "Villaflores (Centro)", lat: 16.2333, lon: -93.2667, zoom: 10.5 },
  { name: "Villa Corzo", lat: 16.1852, lon: -93.2689, zoom: 10.5 },
  { name: "La Concordia", lat: 16.1165, lon: -92.6885, zoom: 10.2 },
  { name: "Ángel Albino Corzo", lat: 15.8731, lon: -92.7239, zoom: 10.2 },
  { name: "El Parral", lat: 16.3686, lon: -93.0086, zoom: 10.5 },
  { name: "Montecristo de Guerrero", lat: 15.7442, lon: -92.6225, zoom: 10.5 },
];

const FRAILESCA_BBOX_COORDS = [
  [-93.771, 15.6645],
  [-92.2955, 15.6645],
  [-92.2955, 16.5858],
  [-93.771, 16.5858],
  [-93.771, 15.6645],
];

export default function MapboxViewer({
  parcelId = "FRA-01",
  parcelName = "Villaflores (La Frailesca)",
  coordinates = { lat: 16.2333, lng: -93.2667 },
  semaforoColor = "signal",
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
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

    map.on("load", async () => {
      map.addSource("frailesca-bbox", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [FRAILESCA_BBOX_COORDS],
          },
        },
      });

      map.addLayer({
        id: "frailesca-bbox-line",
        type: "line",
        source: "frailesca-bbox",
        paint: {
          "line-color": "#F59E0B",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });

      try {
        const res = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}/api/frailesca-geojson`);
        if (res.ok) {
          const geojson = await res.json();
          map.addSource("frailesca-municipios", {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: "frailesca-municipios-fill",
            type: "fill",
            source: "frailesca-municipios",
            paint: {
              "fill-color": "#176b4d",
              "fill-opacity": 0.22,
            },
          });

          map.addLayer({
            id: "frailesca-municipios-outline",
            type: "line",
            source: "frailesca-municipios",
            paint: {
              "line-color": "#F4F1EA",
              "line-width": 1.5,
            },
          });
        }
      } catch {
        return;
      }
    });

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

  const handleResetFrailescaView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [-93.2667, 16.2333],
      zoom: 9.2,
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
              Explorador Satelital • La Frailesca, Chiapas ({parcelId})
            </h2>
          </div>
          <p className="text-xs text-[#647269] mt-0.5">
            Selecciona cualquier punto en el mapa para actualizar las coordenadas de la parcela.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetFrailescaView}
            className="px-2.5 py-1.5 rounded-lg bg-[#e8f1df] hover:bg-[#d7edb4] text-[#176b4d] font-mono text-xs font-bold flex items-center gap-1.5 transition border border-[#cbd9ce]"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#176b4d]" />
            Centrar La Frailesca
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

      <div className="px-4 py-2.5 bg-[#f7f8f3] border-b border-[#dce4dc] flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-mono text-[#176b4d] font-bold flex items-center gap-1 mr-1">
          <Navigation className="w-3 h-3" />
          Municipios Frailesca:
        </span>
        {FRAILESCA_LOCATIONS.map((loc) => {
          const isActive =
            Math.abs(coordinates.lat - loc.lat) < 0.03 &&
            Math.abs(coordinates.lng - loc.lon) < 0.03;
          return (
            <button
              key={loc.name}
              type="button"
              onClick={() => onSelectCoordinate?.(loc.lat, loc.lon)}
              className={`px-2.5 py-1 rounded-full font-mono text-[11px] transition border ${
                isActive
                  ? "bg-[#176b4d] text-white border-[#176b4d] font-bold"
                  : "bg-white text-[#17231c] border-[#dce4dc] hover:border-[#176b4d]"
              }`}
            >
              {loc.name}
            </button>
          );
        })}
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
