class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.supported = this._detectSupport();
    this.onTranscript = null;
    this.onError = null;
    this.onEnd = null;
    this._playing = false;
  }

  _detectSupport() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    return { tts: !!this.synth, stt: !!Rec };
  }

  speak(text, lang) {
    return new Promise((resolve, reject) => {
      if (!this.supported.tts) {
        reject(new Error("浏览器不支持语音合成"));
        return;
      }
      this.stopSpeak();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "zh" ? "zh-CN" : "en-US";
      u.rate = 0.92;
      u.pitch = 1;
      u.onend = () => {
        this._playing = false;
        resolve();
      };
      u.onerror = (e) => {
        this._playing = false;
        reject(e);
      };
      this._playing = true;
      this.synth.speak(u);
    });
  }

  stopSpeak() {
    if (this.synth.speaking) this.synth.cancel();
    this._playing = false;
  }

  startRecognition(lang) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) throw new Error("浏览器不支持语音识别，请使用 Chrome 或 Edge");

    this.stopRecognition();
    this.recognition = new Rec();
    this.recognition.lang = lang === "zh" ? "zh-CN" : "en-US";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    let finalText = "";

    this.recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interim += t;
      }
      const combined = (finalText + interim).trim();
      if (this.onTranscript) this.onTranscript(combined, !!interim);
    };

    this.recognition.onerror = (e) => {
      if (this.onError) this.onError(e.error || "recognition-error");
    };

    this.recognition.onend = () => {
      if (this.onEnd) this.onEnd(finalText.trim());
    };

    this.recognition.start();
    return this.recognition;
  }

  stopRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }
  }
}

if (typeof module !== "undefined") module.exports = { SpeechEngine };
