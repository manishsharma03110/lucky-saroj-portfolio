export function getPortfolioMediaBlobToken(): string {
  const token = process.env.PORTFOLIO_MEDIA_READ_WRITE_TOKEN;
  if (!token?.trim()) {
    throw new Error("Portfolio media Blob credential is not configured.");
  }
  return token;
}
