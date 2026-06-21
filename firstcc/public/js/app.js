const STORAGE_KEY = "interpretation_trainer_v3";

const state = {
  step: 1,
  corpus: null,
  conversation: null,
  turnIndex: 0,
  utterance: null,
  textVisible: true,
  recording: false,
  transcript: "",
  scoreTimer: null,
  recSeconds: 0,
  recTimer: null,
  completedTurns: [],
};

const els = {};
let speech = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  speech = new SpeechEngine();
  cacheElements();
  renderGoals();
  bindEvents();
  checkBrowserSupport();
  await loadCorpus();
  renderHistory();
  updateSteps();
}

function cacheElements() {
  els.categoryFilter = document.getElementById("categoryFilter");
  els.levelFilter = document.getElementById("levelFilter");
  els.corpusInfo = document.getElementById("corpusInfo");
  els.scenarioTitle = document.getElementById("scenarioTitle");
  els.turnMeta = document.getElementById("turnMeta");
  els.dialogueHistory = document.getElementById("dialogueHistory");
  els.speakerBadge = document.getElementById("speakerBadge");
  els.directionBadge = document.getElementById("directionBadge");
  els.categoryBadge = document.getElementById("categoryBadge");
  els.levelBadge = document.getElementById("levelBadge");
  els.sourceText = document.getElementById("sourceText");
  els.btnToggleText = document.getElementById("btnToggleText");
  els.liveTranscript = document.getElementById("liveTranscript");
  els.recTimer = document.getElementById("recTimer");
  els.liveScores = document.getElementById("liveScores");
  els.waveCanvas = document.getElementById("waveCanvas");
  els.feedbackPanel = document.getElementById("feedbackPanel");
  els.feedbackContent = document.getElementById("feedbackContent");
  els.historyList = document.getElementById("historyList");
  els.trainingSection = document.getElementById("trainingSection");
  els.supportNote = document.getElementById("supportNote");
}

async function loadCorpus() {
  try {
    const res = await fetch("data/corpus.json");
    const data = await res.json();
    state.corpus = data;
    populateFilters(data);
    els.corpusInfo.textContent = `语料库：${data.totalUtterances} 条语句 · ${data.totalConversations} 组对话 · 涵盖日常生活、医疗、法律、科技、文化`;
    els.supportNote.textContent = "语料库加载完成。建议使用 Chrome / Edge，并允许麦克风权限。";
    startRandomDialogue();
  } catch (e) {
    els.supportNote.textContent = "语料库加载失败，请确认服务已启动。";
    els.supportNote.classList.add("warn");
  }
}

function populateFilters(data) {
  els.categoryFilter.innerHTML =
    `<option value="all">全部主题（随机）</option>` +
    data.categories.map((c) => `<option value="${c.id}">${c.label}</option>`).join("");
  els.levelFilter.innerHTML =
    `<option value="all">全部难度</option>` +
    `<option value="beginner">入门</option>` +
    `<option value="intermediate">进阶</option>` +
    `<option value="advanced">高级</option>`;
}

function checkBrowserSupport() {
  const parts = [];
  if (!speech.supported.tts) parts.push("语音播放");
  if (!speech.supported.stt) parts.push("语音识别");
  if (parts.length) {
    els.supportNote.textContent = `当前浏览器可能不支持：${parts.join("、")}。建议使用 Chrome / Edge。`;
    els.supportNote.classList.add("warn");
  }
}

function renderGoals() {
  document.getElementById("goalsGrid").innerHTML = TRAINING_GOALS.map(
    (g) => `<div class="goal-item"><strong>${g.title}</strong><span>${g.desc}</span></div>`
  ).join("");
}

function bindEvents() {
  document.getElementById("btnGoTrain").addEventListener("click", () => {
    els.trainingSection.scrollIntoView({ behavior: "smooth" });
    setStep(2);
  });
  document.getElementById("btnRandom").addEventListener("click", startRandomDialogue);
  els.categoryFilter.addEventListener("change", startRandomDialogue);
  els.levelFilter.addEventListener("change", startRandomDialogue);
  els.btnToggleText.addEventListener("click", toggleTextVisibility);
  document.getElementById("btnPlay").addEventListener("click", playSource);
  document.getElementById("btnStopPlay").addEventListener("click", () => speech.stopSpeak());
  document.getElementById("btnRecord").addEventListener("click", toggleRecording);
  document.getElementById("btnFinish").addEventListener("click", finishRecording);
  document.getElementById("btnNextTurn").addEventListener("click", nextTurn);
  document.getElementById("btnNewDialogue").addEventListener("click", startRandomDialogue);
  document.getElementById("btnRepeat").addEventListener("click", repeatTurn);
  document.getElementById("btnClearHistory").addEventListener("click", clearHistory);
}

function filteredUtterances() {
  let list = state.corpus.utterances;
  if (els.categoryFilter.value !== "all") list = list.filter((u) => u.category === els.categoryFilter.value);
  if (els.levelFilter.value !== "all") list = list.filter((u) => u.level === els.levelFilter.value);
  return list;
}

function startRandomDialogue() {
  const list = filteredUtterances();
  if (!list.length) {
    alert("当前筛选条件下没有可用语料。");
    return;
  }
  const convIds = [...new Set(list.map((u) => u.conversationId))];
  const convId = convIds[Math.floor(Math.random() * convIds.length)];
  state.conversation = list
    .filter((u) => u.conversationId === convId)
    .sort((a, b) => a.turn - b.turn);
  state.turnIndex = 0;
  state.completedTurns = [];
  loadCurrentTurn();
  els.feedbackPanel.classList.add("hidden");
  setStep(2);
}

function loadCurrentTurn() {
  state.utterance = state.conversation[state.turnIndex];
  if (!state.utterance) return;

  const u = state.utterance;
  els.scenarioTitle.textContent = `📍 ${u.categoryLabel} · ${u.scenario}`;
  els.turnMeta.textContent = `第 ${u.turn} / ${u.totalTurns} 句 · 对话编号 ${u.conversationId}`;
  els.speakerBadge.textContent = `${u.speakerRole}（${u.speakerLabel}）`;
  els.speakerBadge.className = `speaker-badge ${u.speaker}`;
  els.directionBadge.textContent = `口译方向：${u.directionLabel}`;
  els.categoryBadge.textContent = u.categoryLabel;
  els.levelBadge.textContent = u.levelLabel;

  updateSourceDisplay();
  renderDialogueHistory();
  resetRecordingState();
  setStep(2);
}

function updateSourceDisplay() {
  const u = state.utterance;
  els.sourceText.textContent = u.sourceText;
  els.sourceText.classList.toggle("text-hidden", !state.textVisible);
  els.btnToggleText.textContent = state.textVisible ? "👁 隐藏文本" : "👁 显示文本";
  els.btnToggleText.setAttribute("aria-pressed", String(state.textVisible));
}

function toggleTextVisibility() {
  state.textVisible = !state.textVisible;
  updateSourceDisplay();
}

function renderDialogueHistory() {
  const html = state.completedTurns
    .map(
      (t) => `
    <div class="history-bubble ${t.speaker}">
      <div class="bubble-head">${t.speakerRole} · ${t.directionLabel} · ${t.score}分</div>
      <div class="bubble-src">${escapeHtml(t.sourcePreview)}</div>
      <div class="bubble-interp">→ ${escapeHtml(t.interpPreview)}</div>
    </div>`
    )
    .join("");
  els.dialogueHistory.innerHTML = html || '<p class="muted" style="font-size:0.85rem">本轮对话尚未开始，请播放发言并开始口译。</p>';
}

function resetRecordingState() {
  stopRecording();
  state.transcript = "";
  els.liveTranscript.textContent = "（等待录音…）";
  els.recTimer.textContent = "00:00";
  renderLiveScores(null);
}

function repeatTurn() {
  els.feedbackPanel.classList.add("hidden");
  if (state.completedTurns.length && state.completedTurns[state.completedTurns.length - 1]?.turn === state.utterance.turn) {
    state.completedTurns.pop();
  }
  resetRecordingState();
  renderDialogueHistory();
  setStep(2);
}

function nextTurn() {
  if (state.turnIndex < state.conversation.length - 1) {
    state.turnIndex++;
    loadCurrentTurn();
    els.feedbackPanel.classList.add("hidden");
    els.trainingSection.scrollIntoView({ behavior: "smooth" });
  } else {
    alert(`本组对话 ${state.conversation.length} 句已全部完成！即将开始新的随机对话。`);
    startRandomDialogue();
  }
}

function sourceLang() {
  return state.utterance.direction === "en2zh" ? "en" : "zh";
}

function targetLang() {
  return state.utterance.direction === "en2zh" ? "zh" : "en";
}

function passageForEval() {
  const u = state.utterance;
  return {
    direction: u.direction,
    reference: u.reference,
    keyPoints: u.keyPoints,
  };
}

async function playSource() {
  try {
    setStep(2);
    await speech.speak(state.utterance.sourceText, sourceLang());
  } catch {
    alert("无法播放源语，请检查浏览器是否支持语音合成。");
  }
}

function toggleRecording() {
  if (state.recording) stopRecording();
  else startRecording();
}

function startRecording() {
  if (!speech.supported.stt) {
    alert("当前浏览器不支持语音识别，请使用 Chrome 或 Edge。");
    return;
  }
  try {
    state.recording = true;
    state.transcript = "";
    state.recSeconds = 0;
    els.recTimer.textContent = "00:00";
    state.recTimer = setInterval(() => {
      state.recSeconds++;
      els.recTimer.textContent = formatTime(state.recSeconds);
    }, 1000);

    document.getElementById("btnRecord").textContent = "停止录音";
    document.getElementById("btnRecord").classList.add("recording");
    setStep(3);
    startVisualizer();

    speech.onTranscript = (text) => {
      state.transcript = text;
      els.liveTranscript.textContent = text || "（正在识别…）";
      scheduleLiveScore();
    };
    speech.onError = (err) => {
      if (err !== "no-speech" && err !== "aborted") console.warn("STT:", err);
    };
    speech.onEnd = () => {
      if (state.recording) {
        try {
          speech.startRecognition(targetLang());
        } catch (_) {}
      }
    };
    speech.startRecognition(targetLang());
  } catch (e) {
    alert(e.message || "无法启动录音");
    stopRecording();
  }
}

function scheduleLiveScore() {
  clearTimeout(state.scoreTimer);
  state.scoreTimer = setTimeout(() => {
    if (!state.transcript.trim()) return;
    const fb = buildInterpretationFeedback(state.transcript, passageForEval(), false);
    renderLiveScores(fb);
  }, 400);
}

function stopRecording() {
  if (!state.recording) return;
  state.recording = false;
  clearInterval(state.recTimer);
  clearTimeout(state.scoreTimer);
  speech.stopRecognition();
  stopVisualizer();
  document.getElementById("btnRecord").textContent = "开始录音";
  document.getElementById("btnRecord").classList.remove("recording");
}

function finishRecording() {
  stopRecording();
  if (!state.transcript.trim()) {
    alert("未识别到译语内容，请重新录音。");
    return;
  }
  const fb = buildInterpretationFeedback(state.transcript, passageForEval(), true);
  renderFinalFeedback(fb);
  saveHistory(state.transcript, fb);

  state.completedTurns.push({
    speaker: state.utterance.speaker,
    speakerRole: state.utterance.speakerRole,
    directionLabel: state.utterance.directionLabel,
    score: fb.overall,
    sourcePreview: state.utterance.sourceText.slice(0, 50) + (state.utterance.sourceText.length > 50 ? "…" : ""),
    interpPreview: state.transcript.slice(0, 50) + (state.transcript.length > 50 ? "…" : ""),
    turn: state.utterance.turn,
  });
  renderDialogueHistory();
  setStep(4);
  els.feedbackPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderLiveScores(fb) {
  if (!fb?.overall) {
    els.liveScores.innerHTML = scoreHtml("—", "—", "—", "—");
    return;
  }
  els.liveScores.innerHTML = scoreHtml(fb.accuracy, fb.coherence, fb.elegance, fb.overall);
}

function scoreHtml(a, c, e, t) {
  return `
    <div class="live-score-item"><span>准确性</span><strong>${a}</strong></div>
    <div class="live-score-item"><span>连贯性</span><strong>${c}</strong></div>
    <div class="live-score-item"><span>优美度</span><strong>${e}</strong></div>
    <div class="live-score-item total"><span>综合</span><strong>${t}</strong></div>`;
}

function renderFinalFeedback(fb) {
  const kp = fb.keyPoints
    .map((k) => `<li class="${k.covered ? "ok" : "miss"}">${k.covered ? "✓" : "○"} ${escapeHtml(k.point)}</li>`)
    .join("");
  const u = state.utterance;

  els.feedbackContent.innerHTML = `
    <div class="score-header">
      <div class="score-ring">${fb.overall}</div>
      <div>综合评分 · <span class="level-tag level-${fb.level}">${fb.level}</span></div>
      <p class="muted" style="margin-top:6px;font-size:0.85rem">${u.speakerRole}（${u.speakerLabel}）→ ${u.directionLabel}</p>
    </div>
    <div class="dim-grid">
      <div class="dim-item"><div class="label">准确性</div><div class="val">${fb.accuracy}</div></div>
      <div class="dim-item"><div class="label">连贯性</div><div class="val">${fb.coherence}</div></div>
      <div class="dim-item"><div class="label">优美度</div><div class="val">${fb.elegance}</div></div>
    </div>
    <div class="feedback-section"><h3>关键信息核对</h3><ul class="kp-list">${kp}</ul></div>
    ${fb.praise.length ? `<div class="feedback-section"><h3>优点</h3><ul>${fb.praise.map((p) => `<li>${p}</li>`).join("")}</ul></div>` : ""}
    <div class="feedback-section"><h3>改进建议</h3><ul>${fb.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul></div>
    <div class="feedback-section"><h3>源语原文</h3><p class="text-box">${escapeHtml(u.sourceText)}</p></div>
    <div class="feedback-section"><h3>您的口译</h3><p class="text-box">${escapeHtml(state.transcript)}</p></div>
    <div class="feedback-section"><h3>📘 参考译文（标准答案）</h3><div class="model-box">${escapeHtml(u.reference)}</div></div>
  `;
  els.feedbackPanel.classList.remove("hidden");
  renderLiveScores(fb);
}

function setStep(n) {
  state.step = n;
  document.querySelectorAll(".step").forEach((el, i) => {
    const num = i + 1;
    el.classList.toggle("active", num === n);
    el.classList.toggle("done", num < n);
  });
}

function formatTime(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function saveHistory(text, fb) {
  const u = state.utterance;
  const history = getHistory();
  history.unshift({
    time: new Date().toLocaleString("zh-CN"),
    id: u.id,
    scenario: u.scenario,
    category: u.categoryLabel,
    direction: u.directionLabel,
    overall: fb.overall,
    level: fb.level,
    preview: text.slice(0, 60) + (text.length > 60 ? "…" : ""),
  });
  if (history.length > 30) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    els.historyList.innerHTML = '<p class="muted">暂无记录</p>';
    return;
  }
  els.historyList.innerHTML = history
    .map(
      (h) =>
        `<div class="history-item"><strong>${h.category} · ${h.scenario}</strong> · ${h.direction} · ${h.overall}分<br><span class="muted">${h.time}</span><br>${escapeHtml(h.preview)}</div>`
    )
    .join("");
}

function clearHistory() {
  if (confirm("确定清空训练记录？")) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

let audioCtx, analyser, micStream, animId;

async function startVisualizer() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    audioCtx.createMediaStreamSource(micStream).connect(analyser);
    analyser.fftSize = 64;
    drawWave();
  } catch (_) {}
}

function stopVisualizer() {
  cancelAnimationFrame(animId);
  if (micStream) micStream.getTracks().forEach((t) => t.stop());
  if (audioCtx) audioCtx.close().catch(() => {});
  audioCtx = analyser = micStream = null;
  els.waveCanvas.getContext("2d").clearRect(0, 0, els.waveCanvas.width, els.waveCanvas.height);
}

function drawWave() {
  if (!analyser) return;
  const canvas = els.waveCanvas;
  const ctx = canvas.getContext("2d");
  const buf = new Uint8Array(analyser.frequencyBinCount);
  const draw = () => {
    animId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(buf);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / buf.length;
    for (let i = 0; i < buf.length; i++) {
      const h = (buf[i] / 255) * canvas.height;
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(i * w, canvas.height - h, w - 2, h);
    }
  };
  draw();
}
