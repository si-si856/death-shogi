async function analyzePose(base64Image) {
  try {
    if (!base64Image) {
      console.warn("画像なし");
      return null;
    }

    console.log("AI送信開始");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
画像の人のポーズから以下の駒のどれかを1つだけ答えてください。

候補:
歩, 金, 銀, 桂, 角, 飛

必ず1文字だけ返してください。
説明は禁止。
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

    const validPieces = ["歩", "金", "銀", "桂", "角", "飛"];

    result = result.replace(/\s/g, "");

    if (result.length > 1) {
      for (let p of validPieces) {
        if (result.includes(p)) {
          result = p;
          break;
        }
      }
    }

    console.log("最終判定:", result);

    return validPieces.includes(result) ? result : null;

  } catch (err) {
    console.error("AIエラー:", err);
    return null;
  }
}