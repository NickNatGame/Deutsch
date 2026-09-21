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

Этот проект хостится из репозитория `https://github.com/NickNatGame/Deutsch`.

Так как это project site, а не специальный репозиторий `nicknatgame.github.io`, итоговый адрес будет:

```text
https://nicknatgame.github.io/Deutsch/
```

### Первичная публикация

```powershell
git remote -v
git add .
git commit -m "Build German dictionary"
git push Deutsch master
```

### Включение GitHub Pages

В GitHub открой:

Settings -> Pages -> Build and deployment -> Source: `Deploy from a branch`

Выбери:
- Branch: `master`
- Folder: `/ (root)`

После сохранения GitHub обычно публикует сайт за 1-2 минуты.

Если позже переименуешь ветку в `main`, в Pages надо будет выбрать `main` вместо `master`.
