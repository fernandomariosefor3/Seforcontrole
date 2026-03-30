/* ============================================
   API Helper — SEDUC Superintendent Panel
   ============================================ */

const API = {
  async getAll(table, params = {}) {
    const q = new URLSearchParams({ page: 1, limit: 200, ...params }).toString();
    const r = await fetch(`tables/${table}?${q}`);
    return r.ok ? r.json() : { data: [] };
  },
  async get(table, id) {
    const r = await fetch(`tables/${table}/${id}`);
    return r.ok ? r.json() : null;
  },
  async create(table, data) {
    const r = await fetch(`tables/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok ? r.json() : null;
  },
  async update(table, id, data) {
    const r = await fetch(`tables/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok ? r.json() : null;
  },
  async patch(table, id, data) {
    const r = await fetch(`tables/${table}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.ok ? r.json() : null;
  },
  async delete(table, id) {
    const r = await fetch(`tables/${table}/${id}`, { method: 'DELETE' });
    return r.ok;
  }
};
