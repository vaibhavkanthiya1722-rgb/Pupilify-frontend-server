// src/components/common/skeletons/SAFormSkeleton.jsx

import React from "react";
import { Skeleton } from "@mui/material";

export default function FormSkeleton() {
  return (
    <>
      <div className="sa-form-row">
        <div className="sa-form-field">
          <Skeleton width={120} height={25} />
          <Skeleton height={50} />
        </div>

        <div className="sa-form-field">
          <Skeleton width={120} height={25} />
          <Skeleton height={50} />
        </div>
      </div>

      <div className="sa-form-row">
        <div className="sa-form-field">
          <Skeleton width={120} height={25} />
          <Skeleton height={50} />
        </div>

        <div className="sa-form-field">
          <Skeleton width={120} height={25} />
          <Skeleton height={50} />
        </div>
      </div>

      <Skeleton
        height={45}
        width={150}
        style={{ marginTop: 20 }}
      />
    </>
  );
}