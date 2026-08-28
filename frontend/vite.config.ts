import compression from "vite-plugin-compression";
import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";


export default defineConfig({

  plugins: [

  react(),

  compression(),
],

  base: "/",
});