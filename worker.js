const corsHeaders = (origin, allowedOrigin) => {
  const allowed = allowedOrigin || "*";
  const originAllowed = allowed === "*" || origin === allowed;
  return {
    "Access-Control-Allow-Origin": originAllowed ? (allowed === "*" ? "*" : origin) : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.APP_ORIGIN || "*");
    const respond = (body, status=200) => new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", ...cors }
    });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return respond({ ok: true, service: "English Shadow AI", apiKeyConfigured: Boolean(env.OPENAI_API_KEY) });
    }
    if (url.pathname !== "/api/ai") return respond({ error: "Not found" }, 404);
    if (request.method !== "POST") return respond({ error: "Use POST" }, 405);

    if (env.APP_ORIGIN && origin && origin !== env.APP_ORIGIN) {
      return respond({ error: "Origin ـی ئەم پەڕەیە ڕێگەپێدراو نییە." }, 403);
    }
    if (!env.OPENAI_API_KEY) return respond({ error: "OPENAI_API_KEY لە Cloudflare Worker دانەنراوە." }, 503);

    let body;
    try { body = await request.json(); } catch { return respond({ error: "JSON ـی نادروست." }, 400); }
    const action = String(body.action || "teacher").slice(0, 32);
    const input = String(body.input || "").trim().slice(0, 6000);
    if (!input) return respond({ error: "تکایە دەقێک بنووسە." }, 400);

    const langName = code => code === "ckb" ? "Kurdish Sorani" : code === "en" ? "English" : "automatically detect the source language";
    let instructions = "You are English Shadow, a kind, accurate English teacher for Kurdish Sorani speakers. Use correct natural Kurdish Sorani (Central Kurdish) when explaining. Be concise, helpful, respectful, and suitable for learners. Do not claim a translation is perfect if ambiguous.";
    let prompt = input;
    if (action === "translate") {
      const source = langName(body.source || "auto");
      const target = langName(body.target || "en");
      instructions += ` Translate the user's text from ${source} into ${target}. Return the translation first. Then, if useful, add one short note about meaning or ambiguity. If target is English, keep the English translation natural. If target is Kurdish Sorani, use Kurdish Sorani script. Do not translate the instructions themselves.`;
    } else if (action === "conversation") {
      instructions += " Practice conversational English with the learner. Reply naturally, then add a short correction if their English contains mistakes, and explain the correction in Kurdish Sorani. Keep the conversation moving with one simple follow-up question. If the user writes Kurdish, help them express it in natural English.";
      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
      prompt = history.map(m => `${m.role === "assistant" ? "Tutor" : "Learner"}: ${String(m.text || "").slice(0, 1500)}`).join("\n") + "\nLearner: " + input;
    } else {
      instructions += " Explain grammar, vocabulary, pronunciation, or English usage in Kurdish Sorani unless the user clearly asks for English. Give simple examples and their Sorani meanings. For corrections, show the corrected English sentence and explain the reason.";
    }

    try {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-6-luna",
          instructions,
          input: prompt,
          max_output_tokens: 900
        })
      });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const message = data?.error?.message || `OpenAI API error (${upstream.status})`;
        return respond({ error: message }, upstream.status === 429 ? 429 : 502);
      }
      let text = data.output_text || "";
      if (!text && Array.isArray(data.output)) {
        text = data.output.flatMap(item => item.content || [])
          .filter(c => c.type === "output_text")
          .map(c => c.text || "").join("\n");
      }
      if (!text) return respond({ error: "AI وەڵامی دەقی نەگەڕاندەوە." }, 502);
      return respond({ text, model: env.OPENAI_MODEL || "gpt-6-luna" });
    } catch (err) {
      return respond({ error: "پەیوەندی بە خزمەتگوزاری AI نەکرا. ئینتەرنێت و ڕێکخستنەکان بپشکنە." }, 502);
    }
  }
};
