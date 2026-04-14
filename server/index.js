const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = 5000;

app.get('/api/v1/stats/:name/:tag', async (req, res) => {
    const { name, tag } = req.params;
    const apiKey = process.env.RIOT_API_KEY;

    // Официальный адрес для поиска аккаунта (регион europe)
    const url = `https://riotgames.com{name}/${tag}`;
    
    console.log(`>>> Запрос к Riot: ${url}`);

    try {
        const response = await axios.get(url, {
            headers: { "X-Riot-Token": apiKey }
        });
        
        console.log("✅ Успех: Игрок найден!");
        res.json(response.data); // Вернет gameName, tagLine и puuid
    } catch (e) {
        const status = e.response?.status;
        console.error(`❌ Ошибка API! Статус: ${status || 'Сайт не найден'}`);
        
        res.status(status || 500).json({ 
            error: "Ошибка API", 
            message: e.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`👉 Тест: http://localhost:${PORT}/api/v1/stats/ScreaM/777`);
});
