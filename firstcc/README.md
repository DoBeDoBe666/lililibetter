# 中外对话口译训练 / Bilingual Interpretation Trainer

A web-based interpretation training tool for **Chinese ↔ English consecutive interpreting**, simulating real conversations between foreigners and Chinese speakers. Features 8200+ training utterances, real-time speech recognition, and AI-assisted scoring.

中外对话口译训练 Web 应用，模拟外国人与中国人交替发言场景，支持实时录音识别、三维评分（准确性 / 连贯性 / 优美度）与参考译文对照。

## Features

- **Dialogue-based training** — Foreigner / local speaker alternate turns (EN ↔ ZH)
- **8200+ utterances** across 5 domains: daily life, medical, legal, technology, culture
- **Text-to-Speech** — Source utterances played via browser TTS
- **Real-time STT** — Speech recognition during interpretation
- **Live scoring** — Accuracy, coherence, elegance + overall score
- **Hide/show source text** — Train listening-only mode
- **Reference translations** — Standard answers after each turn
- **Responsive** — Works on desktop and mobile (Chrome / Edge recommended)

## Project Structure

```
firstcc/
├── public/                 # Static web app (deploy this folder)
│   ├── index.html            # Main page
│   ├── css/style.css         # Styles
│   ├── js/
│   │   ├── app.js            # App logic & dialogue flow
│   │   ├── speech.js         # TTS & STT wrapper
│   │   ├── evaluator.js      # Scoring engine
│   │   └── passages.js       # Training goals config
│   └── data/corpus.json      # 8200 utterances (generated)
├── scripts/
│   └── generate-corpus.js    # Corpus generator
├── server.js                 # Local dev server
├── vercel.json               # Vercel deploy config
├── deploy.ps1                # One-click Vercel deploy (Windows)
├── package.json
└── DEPLOY.md                 # Deployment guide
```

## Quick Start

### Local development

```bash
# Requires Node.js 18+
npm start
# Open http://localhost:3000
```

### Regenerate corpus (optional)

```bash
npm run generate-corpus
```

### Deploy to public URL

**Netlify Drop:** Drag the `public/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

**Vercel:**

```bash
npm run deploy
# or: ./deploy.ps1
```

See [DEPLOY.md](./DEPLOY.md) for details.

## Tech Stack

- HTML / CSS / Vanilla JavaScript (no framework)
- Web Speech API (TTS + STT)
- Web Audio API (recording visualizer)
- Rule-based NLP evaluator (no external LLM API required)
- Node.js static server for local dev

## Browser Support

- **Recommended:** Chrome, Edge (full speech support)
- Microphone permission required for recording
- HTTPS recommended for mobile microphone access (automatic on Netlify/Vercel)

## License

MIT — see [LICENSE](./LICENSE)

## Contributing

Issues and pull requests welcome. To add training content, edit `scripts/generate-corpus.js` and run `npm run generate-corpus`.
