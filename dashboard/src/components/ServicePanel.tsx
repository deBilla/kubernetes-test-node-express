import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import { CreateForm } from "./CreateForm";

interface Field {
  name: string;
  label: string;
  type: "text" | "number";
}

interface Props {
  title: string;
  service: string;
  tenantId: string;
  fields: Field[];
  displayKeys: string[];
}

export const ServicePanel: React.FC<Props> = ({ title, service, tenantId, fields, displayKeys }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(service, "/", tenantId);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [service, tenantId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async (data: Record<string, string | number>) => {
    await api.post(service, "/", tenantId, data);
    fetchItems();
  };

  return (
    <div className="panel">
      <h3>{title}</h3>
      <CreateForm fields={fields} onSubmit={handleCreate} />
      <div className="item-list">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : items.length === 0 ? (
          <p className="muted">No items</p>
        ) : (
          <table>
            <thead>
              <tr>
                {displayKeys.map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id || i}>
                  {displayKeys.map((k) => (
                    <td key={k}>{typeof item[k] === "object" ? JSON.stringify(item[k]) : String(item[k] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
