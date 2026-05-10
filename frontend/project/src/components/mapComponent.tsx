import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { IoMapOutline } from "react-icons/io5";

// Marker ikonu bazen düzgün gelmiyor, elinle set et kral
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Numaralı marker ikonu için helper
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: "custom-numbered-marker",
    html: `
      <div style="
        background-color: #006fee;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Koordinat değiştiğinde haritayı oraya kaydıran yardımcı bileşen
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

// Tüm noktaları içine alacak şekilde haritayı zoomlayan yardımcı bileşen
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

// Tıklanan yeri yakalayan bileşen
function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapPoint {
  lat: number;
  lng: number;
  name: string;
}

interface MapProps {
  lat?: number;
  lng?: number;
  name?: string;
  points?: MapPoint[];
  onLocationSelect?: (lat: number, lng: number) => void;
  isSelecting?: boolean;
}

export const MapComponent = ({ lat, lng, name, points, onLocationSelect, isSelecting }: MapProps) => {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);

  const hasPoints = points && points.length > 0;
  const position: [number, number] = hasPoints 
    ? [points[0].lat, points[0].lng] 
    : (selectedPos || [lat || 0, lng || 0]);

  const polylinePositions: [number, number][] = hasPoints 
    ? points.map(p => [p.lat, p.lng]) 
    : [];

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPos([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-divider shadow-inner relative z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {!hasPoints && <ChangeView center={position} />}
        {hasPoints && <FitBounds points={polylinePositions} />}
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isSelecting && <LocationPicker onLocationSelect={handleLocationSelect} />}

        {hasPoints ? (
          <>
            <Polyline positions={polylinePositions} color="#006fee" weight={4} opacity={0.6} dashArray="10, 10" />
            {points.map((p, idx) => (
              <Marker key={idx} position={[p.lat, p.lng]} icon={createNumberedIcon(idx + 1)}>
                <Popup>
                  <div className="font-bold">{idx + 1}. {p.name}</div>
                </Popup>
              </Marker>
            ))}
          </>
        ) : (
          (selectedPos || (lat !== undefined && lng !== undefined)) && (
            <Marker position={selectedPos || [lat!, lng!]} icon={customIcon}>
              {name && <Popup>{name}</Popup>}
            </Marker>
          )
        )}
      </MapContainer>
      {isSelecting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-primary text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
            <IoMapOutline />
            Click on map to select location
          </div>
        </div>
      )}
    </div>
  );
};
