import { Car, Loader2 } from "lucide-react";

export default function Sidebar({ vehicles, activeVehicle, vehicleLoading, onSelectVehicle }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-text"><span>Auto</span>Helper</div>
      </div>

      <div className="upload-section">
        <div className="section-label">Garage</div>

        {vehicles.length === 0 ? (
           <div className="drop-zone" style={{ cursor: "default" }}>
    {vehicleLoading ? (
      <>
        <div className="drop-icon shadow-none">
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
        </div>
        <div className="drop-text">Vehicle information is loading...</div>
      </>
    ) : (
      <>
        <div className="drop-icon"><Car size={28} /></div>
        <div className="drop-text">No vehicle found.</div>
      </>
    )}
  </div>
        ) : (
          <div className="files-list">
            {vehicles.map((vehicle) => {
              const isActive = activeVehicle?.id === vehicle.id;
              const isLoading = vehicleLoading && isActive;
              return (
                <button
                  key={vehicle.id}
                  className={`vehicle-card ${isActive ? "active" : ""}`}
                  onClick={() => onSelectVehicle(vehicle)}
                  disabled={vehicleLoading}
                >
                  {isLoading ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Car size={16} />
                  )}
                  <span>{vehicle.name}</span>
                  {isActive && <span className="active-badge">Active</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
