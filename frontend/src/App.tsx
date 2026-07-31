import { useEffect, useState } from "react";
import "./App.css";

interface Classroom {
  id: number;
  name: string;
  capacity: number;
  hasPc: boolean;
  allowsFood: boolean;
}

// 💡 講義データの型を定義
interface Course {
  id: number;
  name: string;
  teacher: string;
  roomName: string;
  dayOfWeek: string; // "月" ~ "金"
  period: number; // 1 ~ 5
}

function App() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  // 💡 講義データを管理するステート（最初は仮データを3つ入れておきます！）
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: "プログラミングI",
      teacher: "山田教授",
      roomName: "101PCルーム",
      dayOfWeek: "月",
      period: 1,
    },
    {
      id: 2,
      name: "Webデザイン",
      teacher: "佐藤准教授",
      roomName: "大講義室A",
      dayOfWeek: "水",
      period: 3,
    },
    {
      id: 3,
      name: "データベース基礎",
      teacher: "鈴木教授",
      roomName: "101PCルーム",
      dayOfWeek: "金",
      period: 5,
    },
  ]);

  useEffect(() => {
    // 教室データの取得
    fetch("/api/classrooms")
      .then((res) => res.json())
      .then((data) => setClassrooms(data))
      .catch((err) => console.error(err));

    // 💡 本番用: バックエンドから講義データを取得
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCourses(data);
      })
      .catch(() => console.log("講義APIデータの取得に失敗しました"));
  }, []);

  // 💡 時間割の枠組みを定義
  const days = ["月", "火", "水", "木", "金"];
  const periods = [1, 2, 3, 4, 5];

  // 💡 特定の曜日・時限に一致する講義を探す関数
  const findCourse = (day: string, period: number) => {
    return courses.find((c) => c.dayOfWeek === day && c.period === period);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
        color: "#333",
      }}
    >
      <h1>キャンパスWebアプリ</h1>

      {/* 📅 時間割セクション */}
      <section style={{ marginBottom: "40px" }}>
        <h2>マイ時間割（1限〜5限）</h2>

        {/* CSS Gridを使った時間割のテーブル構造 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "50px repeat(5, 1fr)", // 時限の列(50px) + 月〜金(等倍)
            gap: "8px",
            backgroundColor: "#ddd",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          {/* ヘッダー行（空白 + 曜日） */}
          <div
            style={{
              backgroundColor: "#eee",
              padding: "10px",
              fontWeight: "bold",
            }}
          ></div>
          {days.map((day) => (
            <div
              key={day}
              style={{
                backgroundColor: "#eee",
                padding: "10px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {day}曜日
            </div>
          ))}

          {/* 時間割のメイン中身（時限ごとにループ） */}
          {periods.map((period) => (
            <>
              {/* 左端の時限表示（1限、2限...） */}
              <div
                style={{
                  backgroundColor: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {period}限
              </div>

              {/* 各曜日のマス目 */}
              {days.map((day) => {
                const course = findCourse(day, period);
                return (
                  <div
                    key={`${day}-${period}`}
                    style={{
                      backgroundColor: course ? "#e3f2fd" : "#fff", // 講義があれば薄い青
                      border: course ? "2px solid #2196f3" : "1px solid #fff",
                      borderRadius: "4px",
                      minHeight: "80px",
                      padding: "8px",
                      fontSize: "13px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}
                  >
                    {course ? (
                      <>
                        <div style={{ fontWeight: "bold", color: "#1565c0" }}>
                          {course.name}
                        </div>
                        <div style={{ color: "#666", fontSize: "11px" }}>
                          👤 {course.teacher}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            padding: "2px 4px",
                            backgroundColor: "#fff",
                            borderRadius: "3px",
                            fontSize: "11px",
                            border: "1px solid #90caf9",
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          📍 {course.roomName}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: "#ccc" }}>（空き）</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </section>

      <hr />

      {/* 🏫 教室一覧セクション */}
      <section style={{ marginTop: "30px" }}>
        <h2>登録済みの教室一覧</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          {classrooms.map((room) => (
            <div
              key={room.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "left",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{room.name}</h3>
              <p>👤 収容人数: {room.capacity}名</p>
              <p>{room.hasPc ? "💻 PCあり" : "❌ PCなし"}</p>
              <p>{room.allowsFood ? "🍱 飲食可" : "🚭 飲食不可"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
