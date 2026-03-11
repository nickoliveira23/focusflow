import type { createDb } from "../db.js";

export type ReturnTypeCreateDb = Awaited<ReturnType<typeof createDb>>;
