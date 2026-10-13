// SAOverviewSkeleton.jsx
import React from "react";
import { Skeleton } from "@mui/material";

export default function SAOverviewSkeleton() {
  return (
    <div className="sa-content">

      {/* Welcome Banner */}
      <div className="sa-welcome-banner">
        <div>
          <Skeleton variant="text" width={120} height={30} />
          <Skeleton variant="text" width={250} height={50} />
          <Skeleton variant="text" width={300} height={25} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="sa-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="sa-stat">
            <Skeleton variant="circular" width={50} height={50} />
            <Skeleton variant="text" width={80} height={40} />
            <Skeleton variant="text" width={120} height={25} />
          </div>
        ))}
      </div>

      {/* Widgets */}
      <div className="sa-widget-row">
        {[1, 2].map((i) => (
          <div key={i} className="sa-widget">
            <Skeleton variant="text" width={180} height={35} />

            {[1, 2, 3].map((j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "15px"
                }}
              >
                <Skeleton variant="circular" width={15} height={15} />
                <Skeleton variant="text" width="70%" height={25} />
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}