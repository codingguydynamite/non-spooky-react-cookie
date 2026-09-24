import { useEffect, useRef, useState } from "react";
import { GpcNotice } from "./components/GpcNotice";
import { scenarios } from "./scenarios";

function readHash(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

/**
 * Keeps `--pg-banner-height` on the layout in sync with the fixed cookie
 * banner, so the page reserves exactly as much room at the bottom as the
 * banner covers. On a phone the banner is ~350px tall and would otherwise
 * hide the last card of every scenario.
 */
function useBannerHeightVariable(layoutRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const layout = layoutRef.current;
    if (!layout) return;

    const setHeight = (height: number) => {
      layout.style.setProperty("--pg-banner-height", `${Math.ceil(height)}px`);
    };

    let observed: Element | null = null;
    const resize = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeight(entry.contentRect.height);
    });

    const track = () => {
      const banner = document.querySelector(".nsr-banner");
      if (banner === observed) return;
      if (observed) resize.unobserve(observed);
      observed = banner;
      if (banner) {
        resize.observe(banner);
        setHeight(banner.getBoundingClientRect().height);
      } else {
        setHeight(0);
      }
    };

    track();
    // The banner mounts/unmounts with every decision, so watch the DOM for it.
    const mutation = new MutationObserver(track);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutation.disconnect();
      resize.disconnect();
    };
  }, [layoutRef]);
}

export function App() {
  const [current, setCurrent] = useState(readHash);
  const layoutRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const onChange = () => setCurrent(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const active = scenarios.find((scenario) => scenario.id === current) ?? scenarios[0];
  // Compared against the current id in the effect below; idempotent, so the
  // double effect run of StrictMode does not focus the heading on first load.
  const previousId = useRef(active.id);

  useBannerHeightVariable(layoutRef);

  // Announce the page change: title for tabs/screen readers, then move focus
  // and the scroll position to the new scenario's heading. On a phone the
  // picker sits at the top, so without this the new content would start
  // below the fold.
  useEffect(() => {
    document.title = `${active.title} · non-spooky-react-cookie`;
    if (previousId.current === active.id) return;
    previousId.current = active.id;
    window.scrollTo({ top: 0 });
    titleRef.current?.focus({ preventScroll: true });
  }, [active]);

  return (
    <div className="pg-layout" ref={layoutRef}>
      <a className="pg-skip" href="#pg-content">
        Skip to scenario
      </a>

      {/* Phone header: brand + a native <select>, which opens the platform
          picker and keeps the 15 scenarios off the first screen. */}
      <header className="pg-topbar">
        <h1 className="pg-brand pg-brand--inline">non-spooky-react-cookie</h1>
        <label className="pg-picker">
          <span className="pg-picker__label">Scenario</span>
          <select
            className="pg-picker__select"
            value={active.id}
            onChange={(event) => {
              window.location.hash = `#/${event.target.value}`;
            }}
          >
            {scenarios.map((scenario, index) => (
              <option key={scenario.id} value={scenario.id}>
                {String(index + 1).padStart(2, "0")} {scenario.title}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* Desktop sidebar: the full list. Hidden on phones via CSS. */}
      <aside className="pg-sidebar">
        <h1 className="pg-brand">
          non-spooky
          <br />
          react-cookie
        </h1>
        <p className="pg-hint">
          One scenario mounts at a time. Every scenario has its own storage key, so
          decisions never leak between pages.
        </p>
        <nav aria-label="Scenarios">
          <ol className="pg-nav">
            {scenarios.map((scenario) => (
              <li key={scenario.id}>
                <a
                  aria-current={scenario.id === active.id ? "page" : undefined}
                  className={
                    scenario.id === active.id
                      ? "pg-nav__link pg-nav__link--active"
                      : "pg-nav__link"
                  }
                  href={`#/${scenario.id}`}
                >
                  {scenario.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <main className="pg-main" id="pg-content">
        <GpcNotice />
        <header className="pg-header">
          <p className="pg-eyebrow">{active.file}</p>
          <h2 className="pg-title" ref={titleRef} tabIndex={-1}>
            {active.title}
          </h2>
          <p className="pg-summary">{active.summary}</p>
        </header>
        {/* key forces a clean remount (fresh provider) when switching pages */}
        <active.Component key={active.id} />
      </main>
    </div>
  );
}
