import pg from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
export default async function setup() {
  const target = new URL(process.env.DATABASE_URL || "");
  if (process.env.CMS_ALLOW_DESTRUCTIVE_LOCAL_DB_TESTS !== "1" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) ||
      target.pathname !== "/portfolio_e2e") throw new Error("A disposable localhost portfolio_e2e database and explicit test flag are required.");
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Test-only admin credentials are required.");
  const client = new pg.Client({ connectionString: target.href });
  await client.connect();
  try {
    await client.query("INSERT INTO site_settings(id) VALUES ('singleton:settings') ON CONFLICT DO NOTHING");
    await client.query("INSERT INTO about_profile(id) VALUES ('singleton:about') ON CONFLICT DO NOTHING");
    const hash = await bcrypt.hash(password, 12);
    await client.query(`INSERT INTO admin_users(id,email,name,password_hash,role_id)
      SELECT $1,$2,'E2E Administrator',$3,id FROM roles WHERE key='SUPER_ADMIN'
      ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,is_active=true,role_id=EXCLUDED.role_id`, [randomUUID(),email,hash]);
    await client.query("UPDATE about_profile SET headline=$1 WHERE id=$2", ["E2E video editor", "singleton:about"]);
    const base = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
    for (const [index, orientation] of ["portrait","landscape"].entries()) {
      await client.query(`INSERT INTO portfolio_projects(id,title,slug,status,is_featured,display_order,video_url,thumbnail_url,video_orientation)
        VALUES ($1,$2,$3,'published',true,$4,$5,$6,$7)
        ON CONFLICT(slug) DO UPDATE SET video_url=EXCLUDED.video_url,thumbnail_url=EXCLUDED.thumbnail_url,video_orientation=EXCLUDED.video_orientation`,
        [randomUUID(),`E2E ${orientation}`,`e2e-${orientation}`,1000+index,`${base}/e2e/${orientation}.mp4`,"/e2e/poster.png",orientation]);
    }
  } finally { await client.end(); }
  await mkdir("../public/e2e", { recursive: true });
  for (const [name,size] of [["portrait","180x320"],["landscape","320x180"]]) {
    execFileSync("ffmpeg", ["-y","-f","lavfi","-i",`testsrc2=size=${size}:rate=12`,"-t","4","-pix_fmt","yuv420p","-movflags","+faststart",`../public/e2e/${name}.mp4`], { stdio: "ignore" });
  }
  execFileSync("ffmpeg", ["-y","-i","../public/e2e/landscape.mp4","-frames:v","1","../public/e2e/poster.png"], { stdio: "ignore" });
}
