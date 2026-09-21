# Deutsch Dictionary

Статический немецко-русский словарь в стиле компактного GitHub Pages / Notion-интерфейса.

Открыть локально: запусти маленький сервер из этой папки и открой `http://127.0.0.1:4178`.

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);const rel=u.split('/').filter(Boolean).join(path.sep)||'index.html';const file=path.resolve(root,rel);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);});}).listen(4178,'127.0.0.1',()=>console.log('http://127.0.0.1:4178'))"
```

Что есть:
- поиск по немецкому слову, переводу, категории и связанным словам;
- фильтры по виду, части речи и категориям;
- избранное, статусы `Новое`, `Изучено`, `На повторении`;
- правая карточка слова с формами, значениями, примерами и озвучкой через браузер;
- импорт и экспорт JSON;
- импорт CSV из Notion с колонками `Verb (Präteritum, Perfekt)`, `Beispiel`, `Kasus`, `Russisch`.

## Обновление слов из Notion

1. В Notion открой таблицу.
2. Export -> CSV.
3. Положи CSV в `data/notion-verbs.csv`.
4. Запусти:

```powershell
node scripts/convert-notion-csv.js
```

Скрипт пересоберет `words.json`, и именно он будет опубликован на GitHub Pages.

## GitHub Pages

В `https://github.com/Arkkienkeli/Arkkienkeli.github.io` уже есть `index.html` со старой страницей-картой. Поэтому выбери один из двух вариантов.

### Вариант A: словарь как главная страница

Скопируй содержимое этой папки в корень `Arkkienkeli.github.io`. Старый `index.html` будет заменен, а словарь откроется на `https://arkkienkeli.github.io/`.

```powershell
git clone https://github.com/Arkkienkeli/Arkkienkeli.github.io.git
Copy-Item -Recurse -Force .\Deutsch\* .\Arkkienkeli.github.io\
Set-Location .\Arkkienkeli.github.io
git add .
git commit -m "Build German dictionary"
git push -u origin main
```

### Вариант B: словарь в подпапке

Сохраняет старую главную страницу. Словарь будет на `https://arkkienkeli.github.io/deutsch/`.

```powershell
git clone https://github.com/Arkkienkeli/Arkkienkeli.github.io.git
New-Item -ItemType Directory -Force .\Arkkienkeli.github.io\deutsch
Copy-Item -Recurse -Force .\Deutsch\* .\Arkkienkeli.github.io\deutsch\
Set-Location .\Arkkienkeli.github.io
git add .
git commit -m "Add German dictionary"
git push -u origin main
```

Если GitHub попросит включить Pages вручную: Settings -> Pages -> Deploy from a branch -> `main` / root.
