const DESKTOP_LAYOUT_WIDTH = 1200;

const viewportBootstrap = String.raw`(() => {
  const desktopLayoutWidth = ${DESKTOP_LAYOUT_WIDTH};
  const mobileUaPattern = /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|Opera Mini|Mobile/i;
  const androidPattern = /Android/i;
  const desktopUaPattern = /Macintosh|Windows NT|X11|Linux x86_64/i;

  function syncViewportMode() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;

    const ua = navigator.userAgent || '';
    const touchPoints = Number(navigator.maxTouchPoints || 0);
    const screenWidth = Number(window.screen && window.screen.width) || Number.POSITIVE_INFINITY;
    const screenHeight = Number(window.screen && window.screen.height) || Number.POSITIVE_INFINITY;
    const shortScreenSide = Math.min(screenWidth, screenHeight);

    // Restrict desktop-request detection to phone-sized touch hardware. This
    // keeps real desktops, touch laptops and tablets on their natural viewport.
    const phoneSizedTouchHardware = touchPoints > 0 && shortScreenSide <= 600;
    const explicitMobileUa = mobileUaPattern.test(ua);
    const androidDesktopUa = androidPattern.test(ua) && !/Mobile/i.test(ua);
    const genericDesktopUa = desktopUaPattern.test(ua) && !explicitMobileUa;

    const uaData = navigator.userAgentData;
    const clientHintDesktop = Boolean(
      uaData && typeof uaData.mobile === 'boolean' && uaData.mobile === false
    );

    const desktopSiteRequested =
      phoneSizedTouchHardware &&
      (clientHintDesktop || androidDesktopUa || genericDesktopUa);

    const content = desktopSiteRequested
      ? 'width=' + desktopLayoutWidth + ', initial-scale=1, viewport-fit=cover'
      : 'width=device-width, initial-scale=1, viewport-fit=cover';

    if (viewport.getAttribute('content') !== content) {
      viewport.setAttribute('content', content);
    }

    document.documentElement.dataset.viewportMode = desktopSiteRequested
      ? 'desktop-request'
      : 'responsive';
  }

  syncViewportMode();
  window.addEventListener('pageshow', syncViewportMode);
})();`;

export function ViewportModeBootstrap() {
  return (
    <script
      id="viewport-mode-bootstrap"
      dangerouslySetInnerHTML={{ __html: viewportBootstrap }}
    />
  );
}
