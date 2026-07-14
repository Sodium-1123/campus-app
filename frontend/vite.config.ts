import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 👇 ここから下の「preview」の設定を追加します！
  preview: {
    allowedHosts: [
      "campus-app-front.onrender.com", // 👈 RenderのフロントエンドURLを許可！
    ],
  },
});
