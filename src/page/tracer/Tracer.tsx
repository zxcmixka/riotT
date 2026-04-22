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
  agentIcon?: string | null;
  kda: string;
    score: {
    red: number;
    blue: number;
  };
  isMatchMVP: boolean;
  isTeamMVP: boolean;
};

export const Tracer = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<PlayerData | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!query.includes("#")) {
      setError("Введите Name#Tag");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setMatches([]);

    const [name, tag] = query.split("#").map((s) => s.trim());

    try {
      const [mmrRes, matchesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/v1/mmr/eu/${name}/${tag}`),
        axios.get(`http://localhost:5000/api/v1/matches/eu/${name}/${tag}`),
      ]);

      setData(mmrRes.data);
      setMatches(matchesRes.data);

    } catch (e) {
      setError("Ошибка загрузки данных");
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
          onKeyDown={(e) => e.key === "Enter" && fetchStats()}
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
          {/* PLAYER */}
          <div className={s.card}>
            <h2>
              {data.name} <span>#{data.tag}</span>
            </h2>

            <div className={s.rankBlock}>
              <img src={data.images.large} className={s.rankIcon} />

              <div>
                <p>{data.currentTier}</p>
                <p>{data.rankRR} RR</p>
                <p>ELO: {data.elo}</p>
              </div>
            </div>
          </div>

          {/* MATCHES */}
          <div className={s.matches}>
            <h3>Last Matches</h3>

            {matches.map((m, i) => (
              <div key={i} className={s.matchCard}>
                <div>
                  <p className={s.map}>{m.map}</p>
                  <p className={s.mode}>{m.mode}</p>
                </div>

                <div>
                  <p className={m.result === "win" ? s.win : s.loss}>
                    {m.result.toUpperCase()}
                  </p>
                  {m.isMatchMVP === true && (
                    <p className={s.mvp}>🏆 Match MVP</p>
                  )}

                  {m.isTeamMVP === true && !m.isMatchMVP && (
                    <p className={s.teamMvp}>⭐ Team MVP</p>
                  )}
                </div>

                <div className={s.agentBlock}>
                  {m.agentIcon ? (
                    <img
                      src={m.agentIcon}
                      className={s.agentIcon}
                      alt={m.agent}
                    />
                  ) : (
                    <div className={s.agentFallback}>
                      {m.agent}
                    </div>
                  )}

                    <p className={s.agentName}>
                      {m.agent.toUpperCase()}
                    </p>
                </div>

                <div>
                  <p>{m.kda}</p>
                  <div>
                    <p className={s.score}>
                      {m.score.red} : {m.score.blue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};