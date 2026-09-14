import Script from "next/script";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const gaId = measurementId.trim().toUpperCase();
  if (!/^G-[A-Z0-9]+$/.test(gaId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
      </Script>
    </>
  );
}
