import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
// The library ships one stylesheet. Import it once, anywhere in your app.
import "non-spooky-react-cookie/styles.css";
import "./playground.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
