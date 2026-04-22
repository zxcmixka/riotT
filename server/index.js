const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;


// AXIOS INSTANCE (Henrik API)
const henrikAPI = axios.create({
  baseURL: "https://api.henrikdev.xyz/valorant",
  headers: {
    Authorization: process.env.HENRIK_API_KEY || "",
  },
});


//   SIMPLE CACHE (in-memory)

const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 сек

const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.data;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });
};

// HELPERS

const normalizePlayer = (players, name, tag) => {
  return players.find(
    (p) =>
      p.name.toLowerCase() === name.toLowerCase() &&
      p.tag.toLowerCase() === tag.toLowerCase()
  );
};

// ROUTES


// MMR
app.get("/api/v1/mmr/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;
  const cacheKey = `mmr-${region}-${name}-${tag}`;

  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await henrikAPI.get(
      `/v1/mmr/${region}/${name}/${tag}`
    );

    const data = response.data.data;

    const result = {
      name: data.name,
      tag: data.tag,
      region: data.region,

      currentTier: data.currenttierpatched,
      rankRR: data.ranking_in_tier,
      elo: data.elo,

      images: {
        small: data.images.small,
        large: data.images.large,
        triangle: data.images.triangle_down,
      },
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({
      error: true,
      message: e.response?.data || e.message,
    });
  }
});

// MATCHES
app.get("/api/v1/matches/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;
  const cacheKey = `matches-${region}-${name}-${tag}`;

  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await henrikAPI.get(
      `/v3/matches/${region}/${name}/${tag}`
    );

    const matches = response.data.data;

    const formatted = matches.map((match) => {
      const player = normalizePlayer(
        match.players.all_players,
        name,
        tag
      );

      if (!player) return null;

      const isWin =
        (player.team === "Red" && match.teams.red.has_won) ||
        (player.team === "Blue" && match.teams.blue.has_won);

      return {
        map: match.metadata.map,
        mode: match.metadata.mode,
        date: match.metadata.game_start,

        result: isWin ? "win" : "loss",

        agent: player.character,

        kills: player.stats.kills,
        deaths: player.stats.deaths,
        assists: player.stats.assists,

        kda: `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`,

        hs: player.stats.headshots,
        body: player.stats.bodyshots,
        legs: player.stats.legshots,
      };
    }).filter(Boolean);

    setCache(cacheKey, formatted);
    res.json(formatted);
  } catch (e) {
    res.status(e.response?.status || 500).json({
      error: true,
      message: e.message,
    });
  }
});

// STATS
app.get("/api/v1/stats/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;
  const cacheKey = `stats-${region}-${name}-${tag}`;

  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await henrikAPI.get(
      `/v3/matches/${region}/${name}/${tag}`
    );

    const matches = response.data.data;

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let wins = 0;

    matches.forEach((match) => {
      const player = normalizePlayer(
        match.players.all_players,
        name,
        tag
      );

      if (!player) return;

      totalKills += player.stats.kills;
      totalDeaths += player.stats.deaths;
      totalAssists += player.stats.assists;

      if (
        (player.team === "Red" && match.teams.red.has_won) ||
        (player.team === "Blue" && match.teams.blue.has_won)
      ) {
        wins++;
      }
    });

    const games = matches.length || 1;

    const result = {
      games,
      winrate: ((wins / games) * 100).toFixed(1),

      avgKills: (totalKills / games).toFixed(1),
      avgDeaths: (totalDeaths / games).toFixed(1),
      avgAssists: (totalAssists / games).toFixed(1),

      kd: (totalKills / totalDeaths || 0).toFixed(2),
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: true });
  }
});

// PROFILE (всё сразу)
app.get("/api/v1/profile/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;
  const cacheKey = `profile-${region}-${name}-${tag}`;

  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [mmrRes, matchesRes] = await Promise.all([
      henrikAPI.get(`/v1/mmr/${region}/${name}/${tag}`),
      henrikAPI.get(`/v3/matches/${region}/${name}/${tag}`),
    ]);

    const mmr = mmrRes.data.data;
    const matches = matchesRes.data.data;

    const result = {
      player: {
        name: mmr.name,
        tag: mmr.tag,
        region: mmr.region,
      },

      rank: {
        tier: mmr.currenttierpatched,
        rr: mmr.ranking_in_tier,
        elo: mmr.elo,
        image: mmr.images.large,
      },

      matches: matches.slice(0, 5), // последние 5 игр
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Valorant Tracker API работает");
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});