const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_STREAM_URL = 'http://cf.futuremyprovt.com:80/play/live.php?mac=00:1B:79:F8:91:52&stream=1992063&extension=ts&play_token=QcJ8LgFNB1';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get(['/', '/health'], (req, res) => {
    res.status(200).send('Proxy is online');
});

app.get(['/proxy-stream', '/stream-proxy-1'], async (req, res) => {
    try {
        const response = await axios({
            method: 'get',
            url: TARGET_STREAM_URL,
            responseType: 'stream',
            maxRedirects: 5,
            headers: {
                'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
                'Accept': '*/*'
            }
        });

        res.setHeader('Content-Type', 'video/mp2t');
        res.setHeader('Cache-Control', 'no-cache');
        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(err.response?.status || 500).send(`Stream proxy failed: ${err.message}`);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy running on port ${PORT}`);
});