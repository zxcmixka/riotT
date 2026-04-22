const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

const henrikAPI = axios.create({
  baseURL: "https://api.henrikdev.xyz/valorant",
  headers: {
    Authorization: process.env.HENRIK_API_KEY || "",
  },
});

/* =========================
   AGENT CACHE (FIX)
========================= */

let agentMap = {};

const normalize = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace("/", "");

const loadAgents = async () => {
  try {
    const res = await axios.get(
      "https://valorant-api.com/v1/agents?isPlayableCharacter=true"
    );

    res.data.data.forEach((agent) => {
      agentMap[normalize(agent.displayName)] =
        agent.displayIcon;
    });

    console.log("Agents loaded:", Object.keys(agentMap).length);
  } catch (e) {
    console.log("Agent load error:", e.message);
  }
};

loadAgents();

/* =========================
   MMR
========================= */
app.get("/api/v1/mmr/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;

  try {
    const response = await henrikAPI.get(
      `/v1/mmr/${region}/${name}/${tag}`
    );

    const data = response.data.data;

    res.json({
      name: data.name,
      tag: data.tag,
      region: data.region,
      currentTier: data.currenttierpatched,
      rankRR: data.ranking_in_tier,
      elo: data.elo,
      images: {
        small: data.images.small,
        large: data.images.large,
      },
    });
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
});

/* =========================
   MATCHES (FIXED)
========================= */
app.get("/api/v1/matches/:region/:name/:tag", async (req, res) => {
  const { region, name, tag } = req.params;

  try {
    const response = await henrikAPI.get(
      `/v3/matches/${region}/${name}/${tag}`
    );

    const matches = response.data.data;

    const formatted = matches.slice(0, 5).map((match) => {
      const players = match.players.all_players;

      const player = players.find(
        (p) =>
          p.name.toLowerCase() === name.toLowerCase() &&
          p.tag.toLowerCase() === tag.toLowerCase()
      );

      if (!player) return null;

      const isWin =
        (player.team === "Red" && match.teams.red.has_won) ||
        (player.team === "Blue" && match.teams.blue.has_won);

      const matchMVP = players.reduce((best, p) => {
        return (!best || (p.stats.score || 0) > (best.stats.score || 0))
          ? p
          : best;
      }, null);

      const teamPlayers = players.filter(
        (p) => p.team === player.team
      );

      const teamMVP = teamPlayers.reduce((best, p) => {
        return (!best || (p.stats.score || 0) > (best.stats.score || 0))
          ? p
          : best;
      }, null);

      return {
        map: match.metadata.map,
        mode: match.metadata.mode,
        result: isWin ? "win" : "loss",
        agent: player.character,

        agentIcon:
          agentMap[normalize(player.character)] || null,

        kda: `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`,

        score: {
          team: player.team,
          red: match.teams.red.rounds_won,
          blue: match.teams.blue.rounds_won,
        },

        isMatchMVP: matchMVP?.puuid === player.puuid,
        isTeamMVP: teamMVP?.puuid === player.puuid,
      };
    }).filter(Boolean);

    res.json(formatted);
  } catch (e) {
    res.status(500).json({
      error: true,
      message: e.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});