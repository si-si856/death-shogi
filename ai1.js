async function analyzePose(base64Image) {
  try {
    if (!base64Image) {
      console.warn("画像なし");
      return null;
    }

    console.log("AI送信開始");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
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

必ず1文字のみ返してください。
それ以外の出力は禁止。
説明・文章・記号は禁止。
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

    let result =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!result) return null;

    // ⭐ 実際に使う駒だけ
    const validPieces = ["歩", "金", "銀", "角", "飛"];

    result = result.replace(/\s/g, "");

    // ⭐ 余計な文字対策
    if (result.length > 1) {
      for (let p of validPieces) {
        if (result.includes(p)) {
          result = p;
          break;
        }
      }
    }

    // ⭐ 完全防御（存在しない駒は弾く）
    if (!validPieces.includes(result)) {
      console.warn("不正な駒:", result);
      return null;
    }

    console.log("最終判定:", result);

    return result;

  } catch (err) {
    console.error("AIエラー:", err);
    return null;
  }
}