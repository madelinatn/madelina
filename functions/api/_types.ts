export interface Env {
  DB: D1Database;
  IMAGES: KVNamespace;
  ADMIN_USER?: string;
  ADMIN_PASSWORD?: string;
  STAFF_USER?: string;
  STAFF_PASSWORD?: string;
}
