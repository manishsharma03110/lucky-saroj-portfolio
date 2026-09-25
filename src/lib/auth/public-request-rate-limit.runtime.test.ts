import assert from "node:assert/strict";
import { test, after } from "node:test";
import { randomUUID } from "node:crypto";
import { closeDatabasePool } from "../db/core";
import { consumePublicRequest } from "./public-request-rate-limit";
const url=new URL(process.env.DATABASE_URL || "");
if (!["localhost","127.0.0.1"].includes(url.hostname) || url.pathname!=="/ci") throw new Error("Disposable local CI database required");
after(closeDatabasePool);
test("public budgets are atomic across workers and isolated by endpoint",async()=>{
  const headers=new Headers({"x-forwarded-for":randomUUID()});
  const results=await Promise.all(Array.from({length:12},()=>consumePublicRequest(headers,"attachment")));
  assert.equal(results.filter(Boolean).length,5);
  assert.equal(await consumePublicRequest(headers,"contact"),true);
});
