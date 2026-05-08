# death-shogi (VLM将棋)

カメラ画像を Gemini (VLM) に送って「歩/金/銀/角/飛」を判定し、その駒だけ動かせるミニ将棋です（ブラウザで動きます）。

## 使い方

### 1) `config.js` を用意（Git管理しません）

このリポジトリでは API キーをコミットしない想定です。`config.example.js` をコピーして `config.js` を作ってください。

```sh
cp config.example.js config.js
```

`config.js` の `API_KEY` を自分のものに差し替えます。

### 2) ローカルサーバで起動

カメラ (`getUserMedia`) を使うので、`file://` 直開きではなくローカルサーバで開いてください（`localhost` はOK）。

例（Python）:

```sh
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## 注意

- `config.js` は機密情報を含むためコミットしないでください（`.gitignore` 済み）。
- カメラ許可が必要です。

