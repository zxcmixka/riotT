import { useState } from "react";
import axios from "axios";
import s from "./tracer.module.css";

type PlayerData = {
  name: string;
  tag: string;
  region: string;
  currentTier: string;
  rankRR: number;
  elo: number;
  images: {
    small: string;
    large: string;
  };
};

type Match = {
  map: string;
  mode: string;
  result: "win" | "loss";
  agent: string;
  kda: string;
};

export const Tracer = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<PlayerData | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!query.trim()) {
      setError("Введите ник");
      return;
    }

    if (!query.includes("#")) {
      setError("Введите в формате Name#Tag");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setMatches([]);

    const [name, tag] = query.split("#").map(s => s.trim());

    try {
      // 🔥 ДВА ЗАПРОСА ПАРАЛЛЕЛЬНО (быстро и стабильно)
      const [mmrRes, matchesRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/v1/mmr/eu/${name}/${tag}`,
          { headers: { "Cache-Control": "no-cache" } }
        ),
        axios.get(
          `http://localhost:5000/api/v1/matches/eu/${name}/${tag}`,
          { headers: { "Cache-Control": "no-cache" } }
        )
      ]);

      setData(mmrRes.data);
      setMatches(matchesRes.data.slice(0, 5)); // только 5 матчей

    } catch (err) {
      setError("Игрок не найден или ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.title}>VALORANT TRACKER</h1>

      <div className={s.searchBox}>
        <input
          placeholder="Nickname#Tag"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={s.input}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchStats();
          }}
        />

        <button
          type="button"
          onClick={fetchStats}
          className={s.button}
          disabled={loading}
        >
          {loading ? "Loading..." : "SEARCH"}
        </button>
      </div>

      {error && <p className={s.error}>{error}</p>}

      {data && (
        <>
          {/* 🔹 РАНГ */}
          <div className={s.card}>
            <h2>
              {data.name}{" "}
              <span className={s.tag}>#{data.tag}</span>
            </h2>

            <div className={s.rankBlock}>
              <img
                src={data.images?.large}
                alt="rank"
                className={s.rankIcon}
              />

              <div>
                <p className={s.rank}>
                  {data.currentTier}
                </p>

                <p className={s.rr}>
                  {data.rankRR} RR
                </p>

                <p className={s.elo}>
                  ELO: {data.elo}
                </p>

                {/* прогресс */}
                <div className={s.progress}>
                  <div style={{ width: `${data.rankRR}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 МАТЧИ */}
          {matches.length > 0 && (
            <div className={s.matches}>
              <h3>Last Matches</h3>

              {matches.map((m, i) => (
                <div key={i} className={s.matchCard}>
                  <div>
                    <p className={s.map}>{m.map}</p>
                    <p className={s.mode}>{m.mode}</p>
                  </div>

                  <div>
                    <p
                      className={
                        m.result === "win"
                          ? s.win
                          : s.loss
                      }
                    >
                      {m.result.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p>{m.agent}</p>
                  </div>

                  <div>
                    <p>{m.kda}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};