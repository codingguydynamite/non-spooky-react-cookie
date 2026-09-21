// Enables React's act() in Vitest (react-dom checks this flag).
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
