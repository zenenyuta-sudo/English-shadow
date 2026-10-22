# English Shadow — Offline + Online AI

ئەم پڕۆژەیە بۆ GitHub Pages ئامادە کراوە. پێکهاتووە لە:
- `index.html`: ئەپی وێب، فەرهەنگی ناوخۆیی، وانەکان، خوێندنەوەی دەنگ و UI ـی AI.
- `worker.js`: API proxy بۆ Cloudflare Workers. کلیلی OpenAI لە سێرڤەر دەپارێزێت.
- `manifest.webmanifest` و `service-worker.js`: یارمەتی بۆ دامەزراندنی PWA و cache ـی پەڕەکە.
- `sung-jin-woo.jpg`: وێنەی بەکارهێنراو لە بەشی دەربارە.

## 1) بڵاوکردنەوەی ئەپ لە GitHub Pages
1. Repository ـێکی نوێ لە GitHub دروست بکە.
2. `index.html` بار بکە بۆ root ـی repository.
3. Settings → Pages بکەوە.
4. لە Build and deployment، Source ـەکە `Deploy from a branch` هەڵبژێرە؛ branch ـی `main` و folder ـی `/(root)` دیاری بکە.
5. URL ـی GitHub Pages ـەکەت وەربگرە.

## 2) دروستکردنی OpenAI API key
1. لە https://platform.openai.com/api-keys کلیلی API دروست بکە.
2. کلیلی API لە `index.html` یان GitHub مەخە. تەنها لە Cloudflare Worker وەک Secret دایبنێ.
3. بەکارهێنانی API لەوانەیە تێچووی هەبێت؛ billing و usage ـی هەژمارەکەت بپشکنە.

## 3) دروستکردنی Cloudflare Worker
1. بچۆ بۆ https://dash.cloudflare.com/ و Workers & Pages هەڵبژێرە.
2. Create → Worker → Deploy بکە.
3. Edit code بکە و ناوەڕۆکی `worker.js` لەوێ دابنێ، پاشان Deploy بکە.
4. لە Worker ـەکەت: Settings → Variables and Secrets → Add → Secret.
   - Name: `OPENAI_API_KEY`
   - Value: کلیلی API ـەکەت
   - Deploy بکە.
5. هەمان شوێن Variable ـێکی ئاسایی زیاد بکە:
   - Name: `APP_ORIGIN`
   - Value: URL ـی GitHub Pages ـەکەت، وەک `https://YOUR-USERNAME.github.io`
   - تەنها ئەو origin ـە بنووسە، نەک path ـی repository. ئەگەر پەڕەکەت `https://YOUR-USERNAME.github.io/english-shadow/` ـە، origin هەر `https://YOUR-USERNAME.github.io` ـە.
6. (ئارەزوومەندانە) Variable ـی `OPENAI_MODEL` زیاد بکە بۆ گۆڕینی مۆدێل. کۆدەکە بە شێوەی پێشوەختە `gpt-6-luna` بەکاردێنێت؛ ئەگەر ئەم مۆدێلە لە هەژمارەکەت بەردەست نەبوو، مۆدێلێکی بەردەست لە OpenAI dashboard دابنێ.
7. Worker URL ـەکەت وەربگرە، بۆ نموونە `https://english-shadow-ai.YOUR-SUBDOMAIN.workers.dev/api/ai`.

## 4) پەیوەستکردنی ئەپ بە Worker
1. ئەپی GitHub Pages ـەکەت بکەرەوە.
2. بچۆ بۆ ⚙️ ڕێکخستن.
3. Worker API URL دابنێ و `پاشەکەوتکردنی ڕێکخستن` بکە.
4. `تاقیکردنەوەی پەیوەندی` بکە. ئەگەر وەڵام هات، وەرگێڕان و مامۆستای AI تاقی بکەرەوە.

## 5) مۆدی ئۆفلاین
- وانەکان و فەرهەنگی ناوخۆیی بەبێ ئینتەرنێت کار دەکەن.
- وەرگێڕانی ئۆفلاین تەنها بۆ ڕستە و وشەی تۆمارکراوەکانە؛ AI ـی گشتی بەبێ ئینتەرنێت کار ناکات.
- دەنگ و ناسینەوەی دەنگ بە وێبگەڕ و سیستەمەکەتەوە بەستراوە. زۆرجار Chrome باشتر پشتگیری دەکات؛ ناسینەوەی کوردی سۆرانی لە هەموو سیستەمێکدا دڵنیانەکراوە.

## پاراستن و تێچوو
- API key هەرگیز لە فایلەکە یان repository ـی گشتی مەخە.
- ئەگەر Worker بە گشتی بێت، کەسانی تر دەتوانن API ـەکەت بەکاربهێنن و تێچوو زیاد بکەن. بۆ بەکارهێنانی گشتی، rate limit / authentication زیاد بکە و usage ـەکەت چاودێری بکە.
- `APP_ORIGIN` بە تەنها authentication نییە؛ تەنها ڕێکخستنی CORS ـە. بۆ پڕۆژەی گەورەتر، rate limiting و هۆکاری ناساندنی بەکارهێنەر زیاد بکە.


## دامەزراندن لە مۆبایل و کۆمپیوتەر
- پڕۆژەکە لە GitHub Pages بڵاو بکەرەوە (HTTPS پێویستە).
- لە Chrome/Edge، دوگمەی «دامەزراندنی ئەپ» ئەگەر پیشان درا کلیکی بکە؛ یان لە مێنیو هەڵبژاردەی Install app / Add to Home Screen بەکاربهێنە.
- دوگمەی «داگرتن» تەنها HTML ـەکە دادەگرێت؛ بۆ ئەوەی وێنە و PWA وەک پڕۆژەی تەواو کار بکەن، هەموو فایلەکانی ZIP لە یەک فۆڵدەر دابنێ و بڵاوی بکەرەوە.
- بەشی ئۆفلاین فەرهەنگ و وانەی ناوخۆیی هەیە؛ بەشی AI پێویستی بە ئینتەرنێت و Cloudflare Worker هەیە.
