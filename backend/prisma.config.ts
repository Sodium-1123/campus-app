import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, // 👈 接続先URLをここに引っ越し！
  },
});
