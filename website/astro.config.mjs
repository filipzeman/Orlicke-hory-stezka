// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://orlicke-hory-stezka.vercel.app", // Update this with your actual domain
  integrations: [react()],
  output: "server",
  adapter: vercel(),
});
