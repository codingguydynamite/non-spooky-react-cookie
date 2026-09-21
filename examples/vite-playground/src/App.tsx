import { useEffect, useState } from "react";
import { scenarios } from "./scenarios";

function readHash(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

export function App() {
  const [current, setCurrent] = useState(readHash);

  useEffect(() => {
    const onChange = () => setCurrent(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const active = scenarios.find((scenario) => scenario.id === current) ?? scenarios[0];

  return (
    <div className="pg-layout">
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
        <nav>
          <ol className="pg-nav">
            {scenarios.map((scenario) => (
              <li key={scenario.id}>
                <a
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

      <main className="pg-main">
        <header className="pg-header">
          <p className="pg-eyebrow">{active.file}</p>
          <h2 className="pg-title">{active.title}</h2>
          <p className="pg-summary">{active.summary}</p>
        </header>
        {/* key forces a clean remount (fresh provider) when switching pages */}
        <active.Component key={active.id} />
      </main>
    </div>
  );
}
