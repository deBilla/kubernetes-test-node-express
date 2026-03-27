import React from "react";

interface Props {
  tenantId: string;
}

export const TenantSelector: React.FC<Props> = ({ tenantId }) => {
  return (
    <div className="tenant-badge">
      <span className="tenant-dot" />
      {tenantId}
    </div>
  );
};
