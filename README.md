# 3bro — Travel Planner

## الموقع

https://abalzunidi.github.io/3BRO/

## تشغيل محلي (عشان الجوالين يشوفون نفس الداتا)

لازم جهاز الكمبيوتر يبقى شغال:

```bash
npm install
npm run dev
```

في طرف ثاني (لازم يبقى مفتوح):

```bash
npx cloudflared tunnel --url http://localhost:3001
```

بعدين حدّث رابط الـ API إذا تغيّر:

```bash
gh variable set VITE_API_URL --body "https://YOUR-TUNNEL-URL.trycloudflare.com/api"
gh workflow run "Deploy to GitHub Pages"
```

افتح الموقع من الجوالين: https://abalzunidi.github.io/3BRO/  
لازم يظهر **Synced** فوق.
