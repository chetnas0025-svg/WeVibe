class LocalDatabaseClient {
  constructor() {
    this.auth = {
      getSession: async () => {
        const session = localStorage.getItem('local_admin_session');
        return { data: { session: session ? JSON.parse(session) : null }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const session = { user: { email }, token: 'local-admin-mock-token' };
        localStorage.setItem('local_admin_session', JSON.stringify(session));
        return { data: { session }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem('local_admin_session');
        return { error: null };
      }
    };

    this.storage = {
      from: (bucket) => {
        return {
          upload: async (path, file) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const res = await fetch('/api/storage/upload', {
                method: 'POST',
                body: formData
              });
              if (!res.ok) return { data: null, error: new Error(await res.text()) };
              const data = await res.json();
              sessionStorage.setItem(`upload:${path}`, data.publicUrl);
              return { data, error: null };
            } catch (err) {
              return { data: null, error: err };
            }
          },
          getPublicUrl: (path) => {
            const cached = sessionStorage.getItem(`upload:${path}`);
            return { data: { publicUrl: cached || `/uploads/${path.split('/').pop()}` } };
          }
        };
      }
    };
  }

  from(table) {
    const makeQuery = (table) => {
      let queryObj = {
        table: table,
        filters: [],
        orders: [],
        limitVal: null,
        singleVal: false
      };

      const chain = {
        select: (fields) => chain,
        eq: (field, value) => {
          queryObj.filters.push({ type: 'eq', field, value });
          return chain;
        },
        gte: (field, value) => {
          queryObj.filters.push({ type: 'gte', field, value });
          return chain;
        },
        order: (field, options) => {
          queryObj.orders.push({ field, ...options });
          return chain;
        },
        limit: (val) => {
          queryObj.limitVal = val;
          return chain;
        },
        single: () => {
          queryObj.singleVal = true;
          return chain;
        },
        insert: async (data) => {
          try {
            const res = await fetch(`/api/${table}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(Array.isArray(data) ? data[0] : data)
            });
            if (!res.ok) return { data: null, error: new Error(await res.text()) };
            return { data: await res.json(), error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        update: (data) => {
          return {
            eq: async (field, value) => {
              try {
                const res = await fetch(`/api/${table}?${field}=${value}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                if (!res.ok) return { data: null, error: new Error(await res.text()) };
                return { data: await res.json(), error: null };
              } catch (err) {
                return { data: null, error: err };
              }
            }
          };
        },
        delete: () => {
          return {
            eq: async (field, value) => {
              try {
                const res = await fetch(`/api/${table}?${field}=${value}`, {
                  method: 'DELETE'
                });
                if (!res.ok) return { data: null, error: new Error(await res.text()) };
                return { data: await res.json(), error: null };
              } catch (err) {
                return { data: null, error: err };
              }
            }
          };
        },
        then: async (resolve, reject) => {
          try {
            const queryParams = encodeURIComponent(JSON.stringify(queryObj));
            const res = await fetch(`/api/${table}?query=${queryParams}`);
            if (!res.ok) {
              resolve({ data: null, error: new Error(await res.text()) });
              return;
            }
            let data = await res.json();
            if (queryObj.singleVal && Array.isArray(data)) {
              data = data[0] || null;
            }
            resolve({ data, error: null });
          } catch (err) {
            resolve({ data: null, error: err });
          }
        }
      };
      return chain;
    };
    return makeQuery(table);
  }
}

// Global hook so pages can instantiate it
window.LocalDatabaseClient = LocalDatabaseClient;
