import "dotenv/config";
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// メモリ保存用フォールバック
let memoryCourses: any[] = [];

// 静的ファイル（Viteでビルドされたフロントエンド）の配信
const frontendDist = path.resolve(process.cwd(), "../frontend/dist");
app.use(express.static(frontendDist));

// シンプルかつ型エラーが絶対に起きない形！
function getPrisma() {
  return new PrismaClient();
}

// ==========================================
// ① 教室一覧を取得するAPI (GET)
// ==========================================
app.get("/api/classrooms", async (req, res) => {
  try {
    const prisma = getPrisma();
    const classrooms = await prisma.classroom.findMany();
    res.json(classrooms);
  } catch (error) {
    console.error("【GET教室エラー】:", error);
    res.json([]);
  }
});

// ==========================================
// ② 新しい教室を登録するAPI (POST)
// ==========================================
app.post("/api/classrooms", async (req, res) => {
  try {
    const prisma = getPrisma();
    const { name, capacity, hasPc, allowsFood } = req.body;
    const newRoom = await prisma.classroom.create({
      data: { name, capacity, hasPc, allowsFood },
    });
    res.json(newRoom);
  } catch (error) {
    console.error("【POST教室エラー】:", error);
    res.status(500).json({ error: "データの登録に失敗しました" });
  }
});

// ==========================================
// ③ 講義一覧を取得するAPI (GET) ★超重要！
// ==========================================
app.get("/api/courses", async (req, res) => {
  try {
    const prisma = getPrisma();
    const courses = await prisma.course.findMany();
    res.json(courses.length > 0 ? courses : memoryCourses);
  } catch (error) {
    console.warn("【GET講義エラー (メモリ表示にフォールバック)】:", error);
    res.json(memoryCourses);
  }
});

// ==========================================
// ④ ブックマークレットからデータを受け取るAPI (POST)
// ==========================================
app.post("/api/import-courses", async (req, res) => {
  try {
    const courseList = req.body;

    if (!Array.isArray(courseList)) {
      return res.status(400).json({ error: "データが配列ではありません" });
    }

    // メモリ領域に保存
    memoryCourses = courseList.map((c: any, i: number) => ({
      id: i + 1,
      name: c.name || "名称未設定",
      teacher: c.teacher || "未定",
      roomName: c.roomName || "未定",
      dayOfWeek: c.dayOfWeek || "月",
      period: Number(c.period) || 1,
    }));

    // DB接続が利用可能な場合はDBにも保存
    try {
      const prisma = getPrisma();
      await prisma.course.deleteMany();
      for (const course of memoryCourses) {
        await prisma.course.create({
          data: {
            name: course.name,
            teacher: course.teacher,
            roomName: course.roomName,
            dayOfWeek: course.dayOfWeek,
            period: course.period,
          },
        });
      }
    } catch (dbErr) {
      console.warn("【DB保存警告 (メモリへの保存は完了しています)】:", dbErr);
    }

    console.log(
      `🎉 ${memoryCourses.length} 件の講義を正常に保存しました！`,
    );
    res.json({ message: `${memoryCourses.length} 件の講義を同期しました！` });
  } catch (error) {
    console.error("【インポートエラー】:", error);
    res.status(500).json({ error: "データの同期に失敗しました" });
  }
});

// トップページ / フロントエンド画面のルーティング (Express 5 対応)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) {
      res.send("Campus App API Backend is running!");
    }
  });
});

// サーバーを起動（Render環境変数 PORT に対応）
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
});
