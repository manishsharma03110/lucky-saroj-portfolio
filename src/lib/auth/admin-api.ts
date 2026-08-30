import { NextResponse } from "next/server";
import { getApiAuthorizationFailure, type TrustedAdmin } from "./admin-core";

export type ApiAuthorization =
  | { ok: true; admin: TrustedAdmin }
  | { ok: false; response: NextResponse };

export async function authorizeAdminForApi(
  authorize: () => Promise<TrustedAdmin>
): Promise<ApiAuthorization> {
  try {
    return { ok: true, admin: await authorize() };
  } catch {
    const failure = getApiAuthorizationFailure();
    return {
      ok: false,
      response: NextResponse.json(failure.body, { status: failure.status }),
    };
  }
}
