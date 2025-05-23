const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function convertPdfToJson() {
    const lyricsDir = path.join(__dirname, 'public', 'lyrics');
    const outputDir = path.join(__dirname, 'public', 'lyrics-json');

    // 確保輸出目錄存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 讀取所有PDF文件
    const files = fs.readdirSync(lyricsDir);
    
    for (const file of files) {
        if (file.endsWith('.pdf')) {
            try {
                console.log(`正在處理: ${file}`);
                const pdfPath = path.join(lyricsDir, file);
                const dataBuffer = fs.readFileSync(pdfPath);
                
                const options = {
                    pagerender: function(pageData) {
                        return pageData.getTextContent()
                            .then(function(textContent) {
                                let lastY, text = '';
                                for (let item of textContent.items) {
                                    if (lastY == item.transform[5] || !lastY) {
                                        text += item.str;
                                    } else {
                                        text += '\n' + item.str;
                                    }
                                    lastY = item.transform[5];
                                }
                                return text;
                            });
                    }
                };

                const data = await pdfParse(dataBuffer, options);
                
                // 創建JSON文件
                const jsonFileName = file.replace('.pdf', '.json');
                const jsonPath = path.join(outputDir, jsonFileName);
                
                // 只保存文本內容
                const jsonData = {
                    text: data.text || '',
                    title: file.replace('.pdf', '')
                };

                // 確保JSON是有效的
                const jsonString = JSON.stringify(jsonData, null, 2);
                fs.writeFileSync(jsonPath, jsonString, 'utf8');
                
                // 驗證JSON是否有效
                try {
                    JSON.parse(jsonString);
                    console.log(`已轉換: ${file} -> ${jsonFileName}`);
                } catch (e) {
                    console.error(`生成的JSON無效: ${file}`, e);
                }
            } catch (error) {
                console.error(`處理 ${file} 時出錯:`, error);
            }
        }
    }
}

// 執行轉換
convertPdfToJson().then(() => {
    console.log('所有PDF文件轉換完成！');
}).catch(error => {
    console.error('轉換過程中出錯:', error);
}); 