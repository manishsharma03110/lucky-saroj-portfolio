import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

type LoginUser = {
  id?: string;
  sessionVersion?: unknown;
};

export function applyAdminJwt(token: JWT, user?: LoginUser): JWT {
  if (user) {
    token.adminId = user.id;
    token.sessionVersion =
      typeof user.sessionVersion === "number" &&
      Number.isSafeInteger(user.sessionVersion) &&
      user.sessionVersion >= 1
        ? user.sessionVersion
        : undefined;
  }
  return token;
}

export function projectAdminSession(session: Session, token: JWT): Session {
  if (
    session.user &&
    typeof token.adminId === "string" &&
    typeof token.sessionVersion === "number" &&
    Number.isSafeInteger(token.sessionVersion) &&
    token.sessionVersion >= 1
  ) {
    session.user.id = token.adminId;
    session.user.sessionVersion = token.sessionVersion;
  }
  return session;
}
