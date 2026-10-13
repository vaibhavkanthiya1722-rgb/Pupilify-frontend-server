// src/components/common/skeletons/SATableSkeleton.jsx

import React from "react";
import { Skeleton } from "@mui/material";

export default function TableSkeleton({
  rows = 5,
  columns = 8
}) {
  return (
    <div >
      <table className="sa-table">
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i}>
                <Skeleton
                  width={80}
                  height={30}
                  variant="text"
                  className="w-100"
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {[...Array(rows)].map((_, row) => (
            <tr key={row}>
              {[...Array(columns)].map((_, col) => (
                <td key={col}>
                  <Skeleton
                    variant="text"
                    height={30}
                    className="w-100"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

