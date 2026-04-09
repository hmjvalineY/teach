import urllib.request
import xml.etree.ElementTree as ET
import datetime

# Google News RSS 網址 (搜尋 "楊梅高中" OR "楊梅高級中等學校")
RSS_URL = "https://news.google.com/rss/search?q=%22%E6%A5%8A%E6%A2%85%E9%AB%98%E4%B8%AD%22+OR+%22%E6%A5%8A%E6%A2%85%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%22&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

def fetch_news():
    req = urllib.request.Request(RSS_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        xml_data = response.read()
    
    root = ET.fromstring(xml_data)
    news_items = []
    
    # 解析 RSS 中的新聞項目
    for item in root.findall('./channel/item')[:20]: # 只抓取前 20 則最新新聞
        title = item.find('title').text
        link = item.find('link').text
        pubDate = item.find('pubDate').text
        news_items.append({'title': title, 'link': link, 'date': pubDate})
        
    return news_items

def generate_html(news_items):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # 建立基礎的 HTML 結構 (可自行加入 CSS 美化)
    html = f"""
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>楊梅高中 相關新聞自動更新</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }}
            h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
            .update-time {{ color: #7f8c8d; font-size: 0.9em; }}
            .news-item {{ margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }}
            .news-item a {{ color: #2980b9; text-decoration: none; font-weight: bold; font-size: 1.1em; }}
            .news-item a:hover {{ text-decoration: underline; }}
            .news-date {{ color: #95a5a6; font-size: 0.85em; margin-top: 5px; }}
        </style>
    </head>
    <body>
        <h1>📚 楊梅高中 相關新聞即時報</h1>
        <p class="update-time">最後更新時間：{now} (UTC)</p>
        <div class="news-list">
    """
    
    for item in news_items:
        html += f"""
            <div class="news-item">
                <a href="{item['link']}" target="_blank">{item['title']}</a>
                <div class="news-date">{item['date']}</div>
            </div>
        """
        
    html += """
        </div>
    </body>
    </html>
    """
    return html

if __name__ == "__main__":
    print("正在獲取新聞...")
    news = fetch_news()
    print(f"共獲取 {len(news)} 則新聞，正在生成網頁...")
    html_content = generate_html(news)
    
    with open("news/index.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("網頁更新完成！(位置：news/index.html)")