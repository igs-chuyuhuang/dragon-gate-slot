# 排行榜系統

## Google Apps Script 完整邏輯

```javascript
// doGet — 讀取排行榜
function doGet(e) {
  const ss = SpreadsheetApp.getActive().getSheetByName('Scores');
  const data = ss.getDataRange().getValues();
  const scores = data.slice(1).map(row => ({
    name: row[0], score: row[1], time: row[2], team: row[3] || ''
  }));
  scores.sort((a,b) => b.score - a.score);
  return ContentService.createTextOutput(JSON.stringify({scores}))
    .setMimeType(ContentService.MimeType.JSON);
}

// doPost — 提交分數
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActive().getSheetByName('Scores');
    ss.appendRow([data.name, data.score, new Date().toISOString(), data.team || '']);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

## LockService 防並發

- `LockService.getScriptLock()` 取得 script 級鎖
- `waitLock(10000)` 等待最多 10 秒
- 確保多人同時提交不會丟資料
- `finally` 確保異常時也釋放鎖

## POST 繞 CORS

Google Apps Script 部署為 Web App 後，POST 會被 redirect（302），瀏覽器 preflight 失敗。

解法：
```js
fetch(API_BASE, {
  method: 'POST',
  mode: 'no-cors',           // 不發 preflight
  headers: { 'Content-Type': 'text/plain' },  // simple request
  body: JSON.stringify({name, score, team})
});
```

注意：`mode:'no-cors'` 無法讀取回應，所以提交後等 1 秒再 GET 排行榜。

## 姓名加零寬空格防 Sheets 轉數字

問題：Google Sheets 會自動將純數字字串轉為數字格式。

解法：
```js
// 提交時
body: JSON.stringify({ name: '\u200B' + playerName, ... })

// 顯示時
s.name.replace(/\u200B/g, '')
```

## Score Number() 防字串拼接

問題：Sheets 有時回傳 score 為字串。

```js
// 排序
data.scores.sort((a,b) => Number(b.score) - Number(a.score));

// 加總
teams[t] = (teams[t] || 0) + Number(s.score);

// 顯示
Math.round(Number(s.score)).toLocaleString()
```

## 組別平均分排名算法

```js
const teams = {};
const teamCount = {};
data.scores.forEach(s => {
  const t = s.team || '?';
  teams[t] = (teams[t] || 0) + Number(s.score);
  teamCount[t] = (teamCount[t] || 0) + 1;
});
const sorted = Object.entries(teams)
  .map(([t, total]) => [t, total, teamCount[t], Math.round(total / teamCount[t])])
  .sort((a,b) => b[3] - a[3]);  // 按平均分降序
```

## 重試機制

```js
async function submitScore(name, score, team) {
  for (let i = 0; i < 3; i++) {
    try {
      await fetch(API_BASE, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({name, score, team})
      });
      return true;
    } catch(e) {}
    await new Promise(r => setTimeout(r, 1000 + i * 1000));  // 1s, 2s, 3s
  }
  return false;
}
```
