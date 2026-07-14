import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

// 👇 【追加】Prismaが動く前に、環境変数が空っぽならRenderの環境変数を強制適用する
if (!process.env.DATABASE_URL && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL;
}

const app = express();

app.use(cors());
app.use(express.json());

// 👇 【元に戻す】引数は無し！これでTypeScriptのエラーは完全に消えます！
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
    res.status(500).json({ error: "データの取得に失敗しました" });
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
    res.json(courses);
  } catch (error) {
    console.error("【GET講義エラー】:", error);
    res.status(500).json({ error: "講義データの取得に失敗しました" });
  }
});

// ==========================================
// ④ ブックマークレットからデータを受け取るAPI (POST)
// ==========================================
app.post("/api/import-courses", async (req, res) => {
  try {
    const prisma = getPrisma();
    const courseList = req.body;

    if (!Array.isArray(courseList)) {
      return res.status(400).json({ error: "データが配列ではありません" });
    }

    // 重複を防ぐため一度リセット
    await prisma.course.deleteMany();

    // データベースへ1件ずつ保存
    for (const course of courseList) {
      await prisma.course.create({
        data: {
          name: course.name,
          teacher: course.teacher || "未定",
          roomName: course.roomName || "未定",
          dayOfWeek: course.dayOfWeek,
          period: Number(course.period),
        },
      });
    }

    console.log(
      `🎉 データベースに ${courseList.length} 件の講義を保存しました！`,
    );
    // ブックマークレット側で undefined にならないよう、シンプルに文字を返す形式にします
    res.json({ message: `${courseList.length} 件の講義を同期しました！` });
  } catch (error) {
    console.error("【インポートエラー】:", error);
    res.status(500).json({ error: "データの同期に失敗しました" });
  }
});

// サーバーをポート3000番で起動
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
});
