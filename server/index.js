const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/api/v1/mmr/:region/:name/:tag', async (req, res) => {
    const { region, name, tag } = req.params;

    try {
        const url = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${name}/${tag}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: process.env.HENRIK_API_KEY || ""
            }
        });

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
                triangle: data.images.triangle_down
            }
        };

        res.json(result);

    } catch (e) {
        const status = e.response?.status || 500;

        res.status(status).json({
            error: true,
            message: e.response?.data || e.message
        });
    }
});

app.get('/', (req, res) => {
    res.send('Valorant MMR API работает 🚀');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});