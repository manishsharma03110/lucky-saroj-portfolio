import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const client = new Client({ connectionString: databaseUrl, application_name: "ci-phase9-schema-verification" });
await client.connect();

async function one(query, params = []) {
  const result = await client.query(query, params);
  return result.rows[0];
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const requiredColumns = [
    ["site_settings", "logo_image_url"],
    ["page_seo", "og_image_url"],
    ["media_asset_references", "testimonial_id"],
    ["home_page_content", "hero_primary_label"],
    ["home_page_content", "hero_primary_url"],
    ["home_page_content", "hero_showreel_label"],
    ["home_page_content", "hero_showreel_url"],
    ["home_page_content", "hero_image_alt"],
    ["home_page_content", "showreel_eyebrow"],
    ["home_page_content", "showreel_runtime_label"],
    ["home_page_content", "about_profile_image_alt"],
  ];

  for (const [table, column] of requiredColumns) {
    const row = await one(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 AND column_name=$2
      ) AS present`,
      [table, column],
    );
    assert(row?.present === true, `Missing required Phase 9 column: ${table}.${column}`);
  }

  const seoRows = await one("SELECT count(*)::int AS count FROM page_seo WHERE page_key = ANY($1::text[])", [["home", "about", "portfolio", "services", "experience", "contact"]]);
  assert(seoRows?.count === 6, `Expected 6 seeded page_seo rows, found ${seoRows?.count ?? 0}.`);

  const contentRows = await one("SELECT count(*)::int AS count FROM page_content WHERE page_key = ANY($1::text[])", [["global", "about", "services", "experience", "portfolio", "contact"]]);
  assert(contentRows?.count === 6, `Expected 6 seeded page_content rows, found ${contentRows?.count ?? 0}.`);

  const homeRows = await one("SELECT count(*)::int AS count FROM home_page_content WHERE id='singleton:home'");
  assert(homeRows?.count === 1, "Homepage content singleton seed is missing.");

  const constraints = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE conrelid='media_asset_references'::regclass
      AND conname IN ('media_asset_references_owner_valid','media_asset_references_slot_valid')
  `);
  const byName = new Map(constraints.rows.map((row) => [row.conname, row.definition]));
  assert(byName.get("media_asset_references_owner_valid")?.includes("testimonial"), "Media owner constraint does not include testimonial ownership.");
  assert(byName.get("media_asset_references_slot_valid")?.includes("profile_image"), "Media slot constraint does not include testimonial profile_image ownership.");
  assert(byName.get("media_asset_references_slot_valid")?.includes("services_hero_image"), "Media slot constraint does not include page hero ownership.");

  console.log("Phase 9 migration schema verification passed.");
} finally {
  await client.end();
}
