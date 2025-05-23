const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3006;

// 1. 歌詞API路由必須放在靜態服務之前
app.get('/lyrics/:filename', (req, res) => {
    const filename = req.params.filename;
    const jsonPath = path.join(__dirname, 'public', 'lyrics-json', filename);
    console.log('---');
    console.log('[歌詞API] 收到請求:', filename);
    console.log('[歌詞API] 準備讀取路徑:', jsonPath);
    try {
        if (!fs.existsSync(jsonPath)) {
            console.error('[歌詞API] 找不到歌詞檔案:', jsonPath);
            return res.status(404).json({ 
                error: '歌詞檔案不存在',
                filename,
                path: jsonPath
            });
        }
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        try {
            const parsed = JSON.parse(jsonData);
            console.log('[歌詞API] 成功讀取並解析JSON:', filename);
            res.json(parsed);
        } catch (parseErr) {
            console.error('[歌詞API] JSON解析失敗:', parseErr.message);
            res.status(500).json({ 
                error: 'JSON解析失敗',
                filename,
                path: jsonPath,
                details: parseErr.message
            });
        }
    } catch (error) {
        console.error('[歌詞API] 讀取過程出錯:', error.message);
        res.status(500).json({ 
            error: '讀取歌詞檔案時發生錯誤',
            filename,
            path: jsonPath,
            details: error.message
        });
    }
});

// 2. 靜態服務必須放在歌詞API之後
app.use(express.static('public'));

// 3. 其他API或首頁
const musicFiles = {
    '萬萬戀習曲': {
        songs: [
            '萬萬戀習曲 (1).mp3',
            '萬萬戀習曲 (2).mp3',
            '萬萬戀習曲 (3).mp3',
            '萬萬戀習曲 (1)(1).mp3'
        ],
        lyrics: '萬萬戀習曲.json'
    },
    '奶席登場': {
        songs: [
            '奶席登場.mp3',
            '奶席登場 (1).mp3'
        ],
        lyrics: '奶昔登場.json'
    },
    '你喝下了整個下午': {
        songs: [
            '你喝下了整個下午萬萬版本.mp3',
            '你喝下了整個下午萬萬版本 (1).mp3'
        ],
        lyrics: '你喝下了整個下午（萬萬版本）.json'
    },
    '你笑起來像夏天': {
        songs: [
            '你笑起來像夏天萬萬版本.mp3',
            '你笑起來像夏天萬萬版本 (1).mp3',
            '你笑起來像夏天YouSmileLikeSummer.mp3'
        ],
        lyrics: '你笑起來像夏天（萬萬版本.json'
    },
    '溶在你夏天的flow': {
        songs: [
            '溶在你夏天的flowMeltedinYourSummerFlow.mp3'
        ],
        lyrics: '溶在你夏天的flow.json'
    },
    '萬萬的奇幻日常': {
        songs: [
            '萬萬的奇幻日常.mp3',
            '萬萬的奇幻日常 (1).mp3'
        ],
        lyrics: '萬萬的奇幻日常.json'
    }
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`伺服器運行在 http://localhost:${port}`);
}); 