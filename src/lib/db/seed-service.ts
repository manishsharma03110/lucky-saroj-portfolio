import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { withCmsTransaction } from "./core";

const SETTINGS_ID = "singleton:settings";
const ABOUT_ID = "singleton:about";
const ADMIN_BOOTSTRAP_LOCK = 1_347_632;

export type SeedInput = Readonly<{ bootstrapEmail?: string; bootstrapPassword?: string }>;
export type SeedSynchronization = Readonly<{ afterSettingsBootstrap?: () => Promise<void> }>;
export type SeedResult = Readonly<{ settings: "created" | "preserved"; about: "created" | "preserved"; administrator: "created" | "preserved" }>;

function validateBootstrapCredentials(input: SeedInput): { email: string; password: string } {
  const email = input.bootstrapEmail?.trim().toLowerCase();
  const password = input.bootstrapPassword;
  if (!email || !password) throw new Error("Administrator bootstrap credentials are required when no administrator exists.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Administrator bootstrap email is invalid.");
  if (password.length < 12) throw new Error("Administrator bootstrap password must be at least 12 characters long.");
  return { email, password };
}

async function seedRequiredSingletons(synchronization?: SeedSynchronization): Promise<Pick<SeedResult, "settings" | "about">> {
  return withCmsTransaction(async (tx) => {
    const settings = await tx.db.insert<{ id: string }>(sql`INSERT INTO site_settings(id) VALUES (${SETTINGS_ID}) ON CONFLICT (id) DO NOTHING RETURNING id`);
    await synchronization?.afterSettingsBootstrap?.();
    const about = await tx.db.insert<{ id: string }>(sql`INSERT INTO about_profile(id) VALUES (${ABOUT_ID}) ON CONFLICT (id) DO NOTHING RETURNING id`);
    return Object.freeze({ settings: settings.rows[0] ? "created" as const : "preserved" as const, about: about.rows[0] ? "created" as const : "preserved" as const });
  });
}

async function seedAdministrator(input: SeedInput): Promise<SeedResult["administrator"]> {
  const existing = await withCmsTransaction(async (tx) => {
    await tx.query("SELECT pg_advisory_xact_lock($1)", [ADMIN_BOOTSTRAP_LOCK]);
    return Boolean((await tx.db.select(sql`SELECT 1 FROM admin_users LIMIT 1`)).rows[0]);
  });
  if (existing) return "preserved";
  const credentials = validateBootstrapCredentials(input);
  const passwordHash = await bcrypt.hash(credentials.password, 10);
  return withCmsTransaction(async (tx) => {
    await tx.query("SELECT pg_advisory_xact_lock($1)", [ADMIN_BOOTSTRAP_LOCK]);
    if ((await tx.db.select(sql`SELECT 1 FROM admin_users LIMIT 1`)).rows[0]) return "preserved" as const;
    const role = await tx.db.select<{ id: string }>(sql`SELECT id FROM roles WHERE key='SUPER_ADMIN'`);
    if (!role.rows[0]) throw new Error("RBAC migration must be applied before administrator bootstrap.");
    await tx.db.insert(sql`INSERT INTO admin_users(id,email,name,password_hash,is_active,session_version,role_id) VALUES (${crypto.randomUUID()},${credentials.email},'Lucky Saroj',${passwordHash},true,1,${role.rows[0].id})`);
    return "created" as const;
  });
}

export async function runSeed(input: SeedInput, synchronization?: SeedSynchronization): Promise<SeedResult> {
  const singletons = await seedRequiredSingletons(synchronization);
  const administrator = await seedAdministrator(input);
  return Object.freeze({ ...singletons, administrator });
}

export const SEED_CANONICAL_IDS = Object.freeze({ settings: SETTINGS_ID, about: ABOUT_ID, showreel: "singleton:showreel" });
