# Google Sheets 串接設定指南 (Setup Guide)

本指南將協助您建立一個 Google 試算表，並設定 Google Apps Script (GAS) 以接收來自網頁的測驗成績。

## 步驟 1：建立 Google 試算表 (Google Sheet)

1. 前往 [Google Sheets](https://sheets.google.com) 並建立一個新的試算表。
2. 將試算表命名為 **「萬有引力測驗成績」** (或是您喜歡的名稱)。
3. 在第一列 (Row 1) 設定標題欄位：
   - **A1**: `Timestamp` (時間戳記)
   - **B1**: `Name` (姓名)
   - **C1**: `Score` (分數)
   - **D1**: `Answers` (作答詳情)

## 步驟 2：開啟 Apps Script 編輯器

1. 在您的 Google 試算表中，點選上方選單的 **「擴充功能」 (Extensions)** > **「Apps Script」**。
2. 這會開啟一個新的分頁，顯示程式碼編輯器。

## 步驟 3：貼上程式碼

1. 刪除編輯器中預設的 `myFunction` 代碼。
2. 將下方的程式碼完全複製貼上：

```javascript
var SHEET_NAME = "工作表1"; // 請確認這與您的試算表分頁名稱相同 (預設通常是 "工作表1" 或 "Sheet1")

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // 解析傳入的 JSON 資料
    var data = JSON.parse(e.postData.contents);
    
    // 取得當前時間
    var timestamp = new Date();
    
    // 將資料寫入試算表 (對應欄位: Timestamp, Name, Score, Answers)
    // Answers 將以字串形式儲存
    sheet.appendRow([
      timestamp, 
      data.name, 
      data.score, 
      JSON.stringify(data.answers)
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      "result": "success", 
      "message": "Data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error", 
      "error": e.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}
```

3. **重要**：如果您的試算表分頁名稱不是「工作表1」，請修改程式碼第一行的 `SHEET_NAME` 變數。

## 步驟 4：部署為網路應用程式 (Deploy)

1. 點擊右上角的 **「部署」 (Deploy)** 按鈕 > **「新增部署」 (New deployment)**。
2. 在左側齒輪圖示旁選擇 **「網頁應用程式」 (Web app)**。
3. 設定如下：
   - **說明 (Description)**: 萬有引力測驗接收端
   - **執行身分 (Execute as)**: **「我」 (Me)** (這很重要！)
   - **誰可以存取 (Who has access)**: **「任何人」 (Anyone)** (這也非常重要，確保學生不需要登入 Google 也能交卷)。
4. 點擊 **「部署」 (Deploy)**。
5. 第一次部署時，Google 會要求**授權**。
   - 點擊「核對權限」。
   - 選擇您的 Google 帳號。
   - 點擊「進階」 (Advanced) > 點擊「前往... (不安全)」 (Go to ... (unsafe))。
   - 點擊「允許」 (Allow)。
6. 部署成功後，您會看到一個 **「網頁應用程式網址」 (Web App URL)**。
   - 網址看起來像這樣：`https://script.google.com/macros/s/......./exec`
   - **請複製這個網址**。

## 步驟 5：設定網頁

1. 開啟本專案資料夾中的 `script.js` 檔案。
2. 找到最上方的設定變數：
   ```javascript
   const GOOGLE_SCRIPT_URL = "您的_WEB_APP_URL_貼在這裡";
   ```
3. 將您剛剛複製的網址貼入引號中。
4. 存檔，完成！

現在，當學生在網頁上完成測驗並送出，資料就會自動出現在您的 Google 試算表中。
