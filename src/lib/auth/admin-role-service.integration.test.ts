import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { Pool, type PoolClient } from "pg";

const databaseUrl = process.env.TEST_DATABASE_URL;
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 8 }) : null;

async function transaction<T>(work: (client: Pick<PoolClient, "query">) => Promise<T>) {
  if (!pool) throw new Error("TEST_DATABASE_URL is required");
  const client = await pool.connect();
  try { await client.query("BEGIN"); const value = await work(client); await client.query("COMMIT"); return value; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

async function seedAdmins(rows: Array<[string, string, string, boolean?, number?]>) {
  await pool!.query("DELETE FROM admin_users");
  for (const [id, email, role, active = true, version = 1] of rows) {
    await pool!.query(
      `INSERT INTO admin_users(id,email,name,password_hash,is_active,session_version,role_id)
       SELECT $1,$2,$1,'local-test-only',$4,$5,id FROM roles WHERE key=$3`,
      [id, email, role, active, version]
    );
  }
}

async function admin(id: string) {
  return (await pool!.query(`SELECT a.id,r.key role,a.is_active,a.session_version FROM admin_users a JOIN roles r ON r.id=a.role_id WHERE a.id=$1`, [id])).rows[0];
}

async function activeSuperAdminCount() {
  const result = await pool!.query(`SELECT count(*)::int AS count FROM admin_users a JOIN roles r ON r.id=a.role_id WHERE a.is_active AND r.key='SUPER_ADMIN'`);
  return result.rows[0].count as number;
}

before(() => { if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required"); });
after(async () => { await pool?.end(); });

test("sole SUPER_ADMIN delete is denied without changing database state", async () => {
  const { createAdminRoleService } = await import("./admin-role-service");
  const service = createAdminRoleService(transaction);
  await seedAdmins([["sole","sole-delete@test","SUPER_ADMIN"]]);
  assert.equal(await activeSuperAdminCount(), 1);

  // A distinct authorized actor would itself be another active SUPER_ADMIN,
  // so actor === target is the only reachable sole-member service call.
  await assert.rejects(
    service.deleteAdmin({ actorId:"sole",actorSessionVersion:1,targetAdminId:"sole" }),
    { message:"Administrator policy denied." }
  );
  assert.deepEqual(await admin("sole"), { id:"sole",role:"SUPER_ADMIN",is_active:true,session_version:1 });
  assert.equal(await activeSuperAdminCount(), 1);
});

test("sole SUPER_ADMIN disable is denied without version advancement", async () => {
  const { createAdminRoleService } = await import("./admin-role-service");
  const service = createAdminRoleService(transaction);
  await seedAdmins([["sole","sole-disable@test","SUPER_ADMIN"]]);
  assert.equal(await activeSuperAdminCount(), 1);

  await assert.rejects(
    service.setActive({ actorId:"sole",actorSessionVersion:1,targetAdminId:"sole",active:false }),
    { message:"Administrator policy denied." }
  );
  assert.deepEqual(await admin("sole"), { id:"sole",role:"SUPER_ADMIN",is_active:true,session_version:1 });
  assert.equal(await activeSuperAdminCount(), 1);
});

test("sole SUPER_ADMIN demotion is denied without version advancement", async () => {
  const { createAdminRoleService } = await import("./admin-role-service");
  const service = createAdminRoleService(transaction);
  await seedAdmins([["sole","sole-demotion@test","SUPER_ADMIN"]]);
  assert.equal(await activeSuperAdminCount(), 1);

  await assert.rejects(
    service.assignRole({ actorId:"sole",actorSessionVersion:1,targetAdminId:"sole",role:"ADMIN" }),
    { message:"Administrator policy denied." }
  );
  assert.deepEqual(await admin("sole"), { id:"sole",role:"SUPER_ADMIN",is_active:true,session_version:1 });
  assert.equal(await activeSuperAdminCount(), 1);
});

test("operational RBAC service enforces invariants and atomic invalidation", async () => {
  const { createAdminRoleService } = await import("./admin-role-service");
  const service = createAdminRoleService(transaction);

  await seedAdmins([["s1","s1@test","SUPER_ADMIN"],["s2","s2@test","SUPER_ADMIN"],["a1","a1@test","ADMIN"],["e1","e1@test","EDITOR"]]);
  await assert.rejects(service.deleteAdmin({ actorId:"s1",actorSessionVersion:1,targetAdminId:"s1" }));
  await assert.rejects(service.setActive({ actorId:"s1",actorSessionVersion:1,targetAdminId:"s1",active:false }));
  await assert.rejects(service.assignRole({ actorId:"s1",actorSessionVersion:1,targetAdminId:"s1",role:"EDITOR" }));

  await service.assignRole({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",role:"ADMIN" });
  assert.deepEqual(await admin("e1"), { id:"e1", role:"ADMIN", is_active:true, session_version:2 });
  await service.assignRole({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",role:"SUPER_ADMIN" });
  assert.equal((await admin("e1")).session_version, 3);
  await service.assignRole({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",role:"EDITOR" });
  assert.equal((await admin("e1")).session_version, 4);
  await service.setActive({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",active:false });
  assert.equal((await admin("e1")).session_version, 5);
  await service.setActive({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",active:true });
  assert.equal((await admin("e1")).session_version, 6);

  for (const actorId of ["a1","e1"]) {
    const version = (await admin(actorId)).session_version;
    await assert.rejects(service.assignRole({ actorId,actorSessionVersion:version,targetAdminId:"a1",role:"SUPER_ADMIN" }));
    await assert.rejects(service.setActive({ actorId,actorSessionVersion:version,targetAdminId:"a1",active:false }));
    await assert.rejects(service.replaceRolePermissions({ actorId,actorSessionVersion:version,role:"EDITOR",permissions:["dashboard.view"] }));
  }

  await seedAdmins([["s1","s1@test","SUPER_ADMIN"],["s2","s2@test","SUPER_ADMIN"]]);
  const outcomes = await Promise.allSettled([
    service.assignRole({ actorId:"s1",actorSessionVersion:1,targetAdminId:"s2",role:"EDITOR" }),
    service.assignRole({ actorId:"s2",actorSessionVersion:1,targetAdminId:"s1",role:"EDITOR" }),
  ]);
  assert.equal(outcomes.filter(x => x.status === "fulfilled").length, 1);
  const supers = Number((await pool!.query(`SELECT count(*) FROM admin_users a JOIN roles r ON r.id=a.role_id WHERE a.is_active AND r.key='SUPER_ADMIN'`)).rows[0].count);
  assert.equal(supers, 1);
  assert.deepEqual((await pool!.query("SELECT session_version FROM admin_users ORDER BY id")).rows.map(r => r.session_version).sort(), [1,2]);

  const surviving = (await pool!.query(`SELECT a.id,a.session_version FROM admin_users a JOIN roles r ON r.id=a.role_id WHERE r.key='SUPER_ADMIN'`)).rows[0];
  await seedAdmins([["s1","s1@test","SUPER_ADMIN"],["a1","a1@test","ADMIN"],["a2","a2@test","ADMIN"]]);
  const original = (await pool!.query(`SELECT p.key FROM role_permissions rp JOIN roles r ON r.id=rp.role_id JOIN permissions p ON p.id=rp.permission_id WHERE r.key='ADMIN' ORDER BY p.key`)).rows.map(r => r.key);
  await service.replaceRolePermissions({ actorId:"s1",actorSessionVersion:1,role:"ADMIN",permissions:["dashboard.view"] });
  assert.deepEqual((await pool!.query("SELECT session_version FROM admin_users WHERE id IN ('a1','a2') ORDER BY id")).rows.map(r=>r.session_version), [2,2]);

  const rollbackService = createAdminRoleService(async work => transaction(async client => { await work(client); throw new Error("injected failure"); }));
  await assert.rejects(rollbackService.replaceRolePermissions({ actorId:"s1",actorSessionVersion:1,role:"ADMIN",permissions:original }));
  assert.deepEqual((await pool!.query("SELECT session_version FROM admin_users WHERE id IN ('a1','a2') ORDER BY id")).rows.map(r=>r.session_version), [2,2]);
  assert.deepEqual((await pool!.query(`SELECT p.key FROM role_permissions rp JOIN roles r ON r.id=rp.role_id JOIN permissions p ON p.id=rp.permission_id WHERE r.key='ADMIN' ORDER BY p.key`)).rows.map(r=>r.key), ["dashboard.view"]);

  await seedAdmins([["s1","s1@test","SUPER_ADMIN"],["s2","s2@test","SUPER_ADMIN"],["e1","e1@test","EDITOR"]]);
  const failingUpdateService = createAdminRoleService(work => transaction(client => work({
    query: ((text: string, values?: unknown[]) => {
      if (text.startsWith("UPDATE admin_users SET role_id")) throw new Error("injected target update failure");
      return client.query(text, values);
    }) as PoolClient["query"],
  })));
  await assert.rejects(failingUpdateService.assignRole({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",role:"ADMIN" }));
  assert.deepEqual(await admin("e1"), { id:"e1",role:"EDITOR",is_active:true,session_version:1 });

  await pool!.query(`DELETE FROM role_permissions USING roles r,permissions p WHERE role_permissions.role_id=r.id AND role_permissions.permission_id=p.id AND r.key='SUPER_ADMIN' AND p.key='admin_users.manage'`);
  await assert.rejects(service.setActive({ actorId:"s1",actorSessionVersion:1,targetAdminId:"e1",active:false }));
  assert.equal((await admin("e1")).is_active, true);
  await pool!.query(`INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r,permissions p WHERE r.key='SUPER_ADMIN' AND p.key='admin_users.manage'`);
  await pool!.query(`DELETE FROM role_permissions USING roles r,permissions p WHERE role_permissions.role_id=r.id AND role_permissions.permission_id=p.id AND r.key='SUPER_ADMIN' AND p.key='roles.manage'`);
  await assert.rejects(service.replaceRolePermissions({ actorId:"s1",actorSessionVersion:1,role:"EDITOR",permissions:["dashboard.view"] }));
  await pool!.query(`INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r,permissions p WHERE r.key='SUPER_ADMIN' AND p.key='roles.manage'`);
  await service.deleteAdmin({ actorId:"s1",actorSessionVersion:1,targetAdminId:"s2" });
  assert.equal(await admin("s2"), undefined);
  assert.ok(surviving.id);
});
