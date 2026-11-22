import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import {
  KEYS,
  defaultLocale,
  defaultMotion,
  defaultTheme,
  localeSchema,
  motionSchema,
  readStored,
  themeSchema,
} from "./lib/storage";
import { applyMotion, applyTheme } from "./theme/themes";
import "./index.css";

applyTheme(readStored(KEYS.theme, themeSchema, defaultTheme()));
applyMotion(readStored(KEYS.motion, motionSchema, defaultMotion()));
document.documentElement.lang = readStored(KEYS.locale, localeSchema, defaultLocale());

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
