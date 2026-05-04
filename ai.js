async function analyzePose(base64Image) {
  try {
    if (!base64Image) {
      console.warn("画像なし");
      return null;
    }

    console.log("AI送信開始");

    const validPieces = ["歩", "金", "銀", "角", "飛"];

    const extractJsonFromText = (text) => {
      if (!text) return null;
      const cleaned = String(text).trim();

      // ```json ... ``` を剥がす
      const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      const candidate = fenceMatch ? fenceMatch[1].trim() : cleaned;

      // 最初の { から最後の } までを抜く（余計な文言が混ざった時用）
      const start = candidate.indexOf("{");
      const end = candidate.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) return null;
      return candidate.slice(start, end + 1);
    };

    const normalizePiece = (raw) => {
      if (!raw) return null;
      let result = String(raw).trim().replace(/\s/g, "");

      // 余計な文字対策（文章に混ざった場合）
      if (result.length > 1) {
        for (const p of validPieces) {
          if (result.includes(p)) return p;
        }
      }
      return validPieces.includes(result) ? result : null;
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.2
          },
          contents: [
            {
              parts: [
                {
                  text: `
あなたは将棋AIです。

画像の人物のポーズから、次の中から1つだけ選んでください：

歩 / 金 / 銀 / 角 / 飛

重要：
・盤面に存在しない駒は絶対に選ばないこと
・「桂」は存在しないため絶対に出力しないこと

出力はJSONのみ（他の文章は禁止）。
次のスキーマに厳密に従ってください：
{
  "piece": "歩|金|銀|角|飛",
  "scores": { "歩": 0-100, "金": 0-100, "銀": 0-100, "角": 0-100, "飛": 0-100 }
}

ルール：
- "piece" はスコア最大のもの
- "scores" は必ず全キーを含める
- 0-100 は相対スコア（合計は自由）
`
                },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: base64Image.split(",")[1]
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      console.error("APIエラー:", await response.text());
      return null;
    }

    const data = await response.json();

    console.log("AIレスポンス:", data);

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) return null;

    // まずJSONとして読む（スコアを取りたい）
    let chosenPiece = null;
    let scores = null;
    const jsonText = extractJsonFromText(rawText);
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        chosenPiece = normalizePiece(parsed?.piece);
        scores = parsed?.scores && typeof parsed.scores === "object" ? parsed.scores : null;
      } catch (e) {
        // JSON崩れ時はフォールバック
      }
    }

    // JSONが取れなかった時は従来どおり文字列から推定
    if (!chosenPiece) {
      chosenPiece = normalizePiece(rawText);
    }

    // スコアはデバッグ出力（なければ無視）
    if (scores) {
      try {
        const normalized = {};
        for (const p of validPieces) {
          const v = Number(scores[p]);
          normalized[p] = Number.isFinite(v) ? v : null;
        }
        console.log("AIスコア:", normalized);
        window.dispatchEvent(new CustomEvent("ai:scores", { detail: normalized }));
      } catch (e) {
        // noop
      }
    }

    // ⭐ 完全防御（存在しない駒は弾く）
    if (!chosenPiece) {
      console.warn("不正な駒:", rawText);
      return null;
    }

    console.log("最終判定:", chosenPiece);

    return chosenPiece;

  } catch (err) {
    console.error("AIエラー:", err);
    return null;
  }
}
