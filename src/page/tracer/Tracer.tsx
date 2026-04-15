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

export const Tracer = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<PlayerData | null>(null);
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

    const [name, tag] = query.split("#").map(s => s.trim());

    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/mmr/eu/${name}/${tag}`
      );

      setData(res.data);
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

        <button onClick={fetchStats} className={s.button}>
          {loading ? "..." : "SEARCH"}
        </button>
      </div>

      {error && <p className={s.error}>{error}</p>}

      {data && (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};