import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const createCustomMarker = (severity) => {
  const severityColors = {
    low: "#2ecc71",
    medium: "#f39c12",
    high: "#e74c3c",
    critical: "#c0392b",
  }

  const color = severityColors[severity] || "#95a5a6"

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 16px;
        color: white;
      ">
        <i class="fas fa-exclamation" style="font-size: 14px;"></i>
      </div>
    `,
    className: "custom-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

export const MapComponent = ({ reports, onMarkerClick, getSeverityColor }) => {
  const defaultCenter = [-6.2, 106.8] // Jakarta coordinates

  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ width: "100%", height: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {reports.map((report) => (
        <Marker
          key={report._id}
          position={[report.location?.coordinates?.[1] || -6.2, report.location?.coordinates?.[0] || 106.8]}
          icon={createCustomMarker(report.aiAnalysis?.severity)}
          eventHandlers={{
            click: () => onMarkerClick(report),
          }}
        >
          <Popup>
            <div className="map-popup">
              <h4>{report.title}</h4>
              <p>
                <strong>Damage:</strong> {report.aiAnalysis?.damage_type || "Unknown"}
              </p>
              <p>
                <strong>Severity:</strong> {report.aiAnalysis?.severity?.toUpperCase() || "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {report.status.replace("_", " ").toUpperCase()}
              </p>
              {report.location?.address && (
                <p>
                  <small>{report.location.address}</small>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
