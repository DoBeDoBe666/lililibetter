const ZH_RE = /[\u4e00-\u9fff]/;
const EN_FILLERS = new Set(["um", "uh", "er", "like", "you", "know", "well", "so"]);
const ZH_FILLERS = ["那个", "这个", "嗯", "啊", "就是", "然后"];

function isChinese(text) {
  const chars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  return chars > letters;
}

function tokenize(text, langHint) {
  const chinese = langHint ? langHint === "zh" : isChinese(text);
  if (chinese) {
    return text
      .replace(/[^\u4e00-\u9fffA-Za-z0-9%]/g, " ")
      .split(/\s+/)
      .flatMap((part) => {
        if (/[\u4e00-\u9fff]/.test(part)) {
          const chars = [...part];
          const grams = [];
          for (let i = 0; i < chars.length; i++) grams.push(chars[i]);
          for (let i = 0; i < chars.length - 1; i++) grams.push(chars[i] + chars[i + 1]);
          return grams;
        }
        return part.length > 1 ? [part.toLowerCase()] : [];
      })
      .filter(Boolean);
  }
  return text
    .toLowerCase()
    .replace(/[^\w\s%'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function overlapScore(a, b, lang) {
  const ta = new Set(tokenize(a, lang));
  const tb = new Set(tokenize(b, lang));
  if (!ta.size || !tb.size) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / Math.max(ta.size, tb.size);
}

function checkKeyPoints(userText, keyPoints, targetLang) {
  const user = userText.toLowerCase();
  return keyPoints.map((point) => {
    const tokens = tokenize(point, targetLang);
    const hits = tokens.filter((t) => user.includes(t.toLowerCase()) || userText.includes(t));
    const ratio = tokens.length ? hits.length / tokens.length : 0;
    return { point, covered: ratio >= 0.34, ratio };
  });
}

function scoreAccuracy(userText, passage) {
  const targetLang = passage.direction === "en2zh" ? "zh" : "en";
  const kp = checkKeyPoints(userText, passage.keyPoints, targetLang);
  const kpScore = kp.length ? (kp.filter((k) => k.covered).length / kp.length) * 100 : 0;
  const refScore = overlapScore(userText, passage.reference, targetLang) * 100;
  const score = Math.round(kpScore * 0.55 + refScore * 0.45);
  return { score: Math.min(100, score), keyPoints: kp };
}

function scoreCoherence(userText, targetLang) {
  const trimmed = userText.trim();
  if (!trimmed) return { score: 0, notes: ["尚未检测到有效译语内容。"] };

  const sentences = trimmed.split(/[。！？.!?]+/).filter((s) => s.trim().length > 2);
  const notes = [];
  let score = 55;

  if (sentences.length >= 1) score += 15;
  if (sentences.length >= 2) score += 10;

  const connectors =
    targetLang === "zh"
      ? (trimmed.match(/因此|然而|同时|此外|因为|所以|但|而且/g) || []).length
      : (trimmed.match(/\b(however|therefore|moreover|because|although|while|and|but)\b/gi) || []).length;
  if (connectors >= 1) score += 12;
  else notes.push("可添加适当衔接词，增强句间逻辑。");

  const avgLen =
    sentences.reduce((sum, s) => sum + tokenize(s, targetLang).length, 0) / Math.max(1, sentences.length);
  if (avgLen >= 4 && avgLen <= 28) score += 10;
  else if (avgLen < 3) notes.push("表达略显碎片化，可合并短句。");
  else if (avgLen > 35) notes.push("单句信息过满，口译可适当切分。");

  if (notes.length === 0) notes.push("语段衔接较为自然。");
  return { score: Math.min(100, score), notes };
}

function scoreElegance(userText, reference, targetLang) {
  const trimmed = userText.trim();
  if (!trimmed) return { score: 0, notes: ["暂无内容可评。"] };

  const notes = [];
  let score = 50;
  const tokens = tokenize(trimmed, targetLang);
  const uniqueRatio = new Set(tokens).size / Math.max(1, tokens.length);
  if (uniqueRatio > 0.55) score += 15;
  else notes.push("用词重复较多，可尝试同义替换。");

  const refLen = tokenize(reference, targetLang).length;
  const userLen = tokens.length;
  if (userLen >= refLen * 0.55 && userLen <= refLen * 1.6) score += 15;
  else notes.push("篇幅与参考译文相比偏差较大，可调整详略。");

  let fillerCount = 0;
  if (targetLang === "en") {
    tokens.forEach((t) => {
      if (EN_FILLERS.has(t)) fillerCount++;
    });
  } else {
    ZH_FILLERS.forEach((f) => {
      if (trimmed.includes(f)) fillerCount++;
    });
  }
  if (fillerCount <= 1) score += 12;
  else notes.push("冗余填充词偏多，影响表达简洁度。");

  const sim = overlapScore(trimmed, reference, targetLang);
  if (sim > 0.35) score += 10;

  if (notes.length === 0) notes.push("表达较为自然，符合口译输出习惯。");
  return { score: Math.min(100, score), notes };
}

function buildInterpretationFeedback(userText, passage, isFinal = false) {
  const trimmed = (userText || "").trim();
  const targetLang = passage.direction === "en2zh" ? "zh" : "en";

  if (!trimmed) {
    return {
      overall: 0,
      accuracy: 0,
      coherence: 0,
      elegance: 0,
      level: "待录音",
      keyPoints: [],
      suggestions: ["点击「播放源语」后，再按「开始录音」进行口译。"],
      praise: [],
      isFinal,
    };
  }

  const acc = scoreAccuracy(trimmed, passage);
  const coh = scoreCoherence(trimmed, targetLang);
  const ele = scoreElegance(trimmed, passage.reference, targetLang);
  const overall = Math.round(acc.score * 0.45 + coh.score * 0.3 + ele.score * 0.25);

  const suggestions = [];
  const praise = [];
  acc.keyPoints.filter((k) => !k.covered).forEach((k) => suggestions.push(`准确性：补充「${k.point}」相关信息`));
  coh.notes.filter((n) => n.includes("可") || n.includes("偏")).forEach((n) => suggestions.push(`连贯性：${n}`));
  ele.notes.filter((n) => n.includes("可") || n.includes("偏") || n.includes("偏多")).forEach((n) => suggestions.push(`优美度：${n}`));

  if (acc.score >= 80) praise.push("关键信息覆盖较好。");
  if (coh.score >= 80) praise.push("语段连贯性良好。");
  if (ele.score >= 80) praise.push("表达自然度较高。");
  if (suggestions.length === 0) suggestions.push("可对照参考译文，比较用词与信息顺序。");

  const level =
    overall >= 85 ? "优秀" : overall >= 70 ? "良好" : overall >= 55 ? "合格" : "需加强";

  return {
    overall,
    accuracy: acc.score,
    coherence: coh.score,
    elegance: ele.score,
    level,
    keyPoints: acc.keyPoints,
    suggestions: suggestions.slice(0, 5),
    praise,
    isFinal,
  };
}

if (typeof module !== "undefined") module.exports = { buildInterpretationFeedback };
