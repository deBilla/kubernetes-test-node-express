const BASE = "/api";

export const api = {
  async request(service: string, path: string, tenantId: string, options?: RequestInit) {
    const res = await fetch(`${BASE}/${service}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
        ...options?.headers,
      },
    });
    return res.json();
  },

  get(service: string, path: string, tenantId: string) {
    return this.request(service, path, tenantId);
  },

  post(service: string, path: string, tenantId: string, body: object) {
    return this.request(service, path, tenantId, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(service: string, path: string, tenantId: string, body: object) {
    return this.request(service, path, tenantId, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};
