import { loginSchema } from "@/lib/validations/auth";

export type CredentialAdmin = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  sessionVersion: number;
  isActive: boolean;
};

type CredentialDependencies = {
  findByEmail: (email: string) => Promise<CredentialAdmin | null>;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
};

export async function authorizeAdminCredentials(
  raw: unknown,
  dependencies: CredentialDependencies
) {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return null;

  const email = parsed.data.email.toLowerCase().trim();
  const user = await dependencies.findByEmail(email);
  if (!user) return null;

  const validPassword = await dependencies.verifyPassword(parsed.data.password, user.passwordHash);
  if (!validPassword || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    sessionVersion: user.sessionVersion,
  };
}
