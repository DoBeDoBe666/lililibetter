/**
 * Generates 8000+ bilingual interpretation training utterances
 * grouped into foreigner ↔ Chinese dialogue scenarios.
 */
const fs = require("fs");
const path = require("path");

const CATEGORIES = {
  daily: { label: "日常生活", scenarios: ["餐厅就餐", "超市购物", "乘坐出租车", "酒店入住", "机场问路", "银行开户", "快递取件", "社区活动"] },
  medical: { label: "医疗健康", scenarios: ["挂号咨询", "描述症状", "取药说明", "体检预约", "医保报销", "急诊分诊", "牙科就诊", "康复指导"] },
  legal: { label: "法律事务", scenarios: ["签证申请", "合同签署", "劳动纠纷", "租房协议", "知识产权", "交通事故", "法律咨询", "公证认证"] },
  tech: { label: "科技领域", scenarios: ["产品发布", "技术支持", "学术会议", "创业路演", "数据分析", "网络安全", "人工智能", "软件开发"] },
  culture: { label: "文化交流", scenarios: ["博物馆参观", "节日庆典", "艺术展览", "留学交流", "商务宴请", "礼仪介绍", "历史讲解", "非遗体验"] },
};

const LEVELS = [
  { id: "beginner", label: "入门" },
  { id: "intermediate", label: "进阶" },
  { id: "advanced", label: "高级" },
];

const FOREIGNERS = ["Mr. Smith", "Ms. Johnson", "Dr. Brown", "Mr. Wilson", "Ms. Davis", "Mr. Miller"];
const LOCALS = ["李女士", "王医生", "张律师", "陈工程师", "刘导游", "赵经理"];

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function enDaily(seed, scenario) {
  const lines = [
    `Excuse me, could you tell me how much this item costs? It doesn't have a price tag.`,
    `I'd like to make a reservation for two people at seven o'clock this evening.`,
    `Could you call a taxi for me? I need to get to the airport by nine thirty.`,
    `I checked in online, but I haven't received my room key yet.`,
    `Where can I find the baggage claim area for international flights?`,
    `I'd like to open a savings account. What documents do I need to bring?`,
    `I'm here to pick up a package. The tracking number is on my phone.`,
    `Are there any community events this weekend that visitors can join?`,
  ];
  return lines[seed % lines.length];
}

function zhDaily(seed, scenario) {
  const lines = [
    `这件商品今天打八折，会员还可以再减十元。`,
    `您的座位已经准备好了，请跟我来这边。`,
    `大概 fifteen 分钟可以到机场，路上可能会有一点堵。`,
    `您的房间在十二楼，这是房卡和早餐券。`,
    `国际航班的行李提取在二号转盘，往左走到底就是。`,
    `开户需要身份证和护照，原件带来就可以办理。`,
    `请出示取件码，我帮您到货架上找。`,
    `社区周末有书法体验课，外国朋友也可以报名参加。`,
  ];
  return lines[seed % lines.length];
}

function enMedical(seed) {
  const lines = [
    `I've had a sore throat and a mild fever since yesterday. Should I see a doctor today?`,
    `Do I need an appointment for a general check-up, or can I walk in?`,
    `How should I take this medicine — before or after meals?`,
    `Does my insurance cover this blood test? I have international health coverage.`,
    `The pain in my chest comes and goes. It's been happening for about three days.`,
    `I need a medical certificate for my employer. Can you provide one?`,
    `Is this vaccine suitable for adults over fifty? I have no known allergies.`,
    `How long will the physical therapy session take each time?`,
  ];
  return lines[seed % lines.length];
}

function zhMedical(seed) {
  const lines = [
    `请先填这张分诊表，测量体温后到内科等候。`,
    `这种药一天三次，每次两片，饭后半小时服用。`,
    `您的检查报告明天下午可以取，也可以在 APP 上查看。`,
    `医保可以报销大部分费用，自费部分请到窗口缴费。`,
    `如果症状加重，比如呼吸困难，请立即来急诊。`,
    `建议您多喝水，注意休息，三天后过来复查。`,
    `这颗牙需要进一步治疗，我先帮您缓解疼痛。`,
    `康复训练每周两次，每次大约四十五分钟。`,
  ];
  return lines[seed % lines.length];
}

function enLegal(seed) {
  const lines = [
    `I'm applying for a work visa. What supporting documents are required?`,
    `Could you explain this clause about termination notice in plain language?`,
    `My employer hasn't paid my overtime wages for two months. What are my options?`,
    `I'd like to review the rental agreement before signing. Are there any hidden fees?`,
    `We need to register our trademark in China. How long does the process take?`,
    `I was involved in a minor traffic accident. Should I contact my insurance first?`,
    `Is verbal agreement legally binding in this type of business deal?`,
    `I need to notarize these documents for use overseas. What's the procedure?`,
  ];
  return lines[seed % lines.length];
}

function zhLegal(seed) {
  const lines = [
    `工作签证需要提供雇主邀请函和有效护照原件。`,
    `合同里这条款的意思是提前三十天书面通知可以解除协议。`,
    `您可以先向劳动监察部门投诉，也可以申请劳动仲裁。`,
    `租房押金一般是一个月租金，退租时核对房屋状况后退还。`,
    `商标注册通常需要一到两年，建议先进行近似查询。`,
    `轻微事故请先拍照留证，并及时通知保险公司。`,
    `重要商业合同建议采用书面形式，口头约定举证较困难。`,
    `公证需要带原件和相关复印件，翻译件需经认证。`,
  ];
  return lines[seed % lines.length];
}

function enTech(seed) {
  const lines = [
    `Our new platform uses machine learning to personalize user recommendations.`,
    `I'm getting an error code when syncing data. Can you walk me through troubleshooting?`,
    `Today's keynote will cover advances in quantum computing and their commercial applications.`,
    `We're seeking seed funding to scale our AI-powered translation service globally.`,
    `The dashboard shows a twenty percent drop in retention. We need to analyze user behavior.`,
    `All employees must enable two-factor authentication by the end of this month.`,
    `This model achieves ninety-two percent accuracy on the benchmark dataset.`,
    `We're migrating to a microservices architecture to improve system reliability.`,
  ];
  return lines[seed % lines.length];
}

function zhTech(seed) {
  const lines = [
    `新版本增加了语音识别功能，支持中英文混合输入。`,
    `请先检查网络连接，然后清除缓存再重新登录试试。`,
    `下午的分论坛将讨论大模型在医疗诊断中的应用前景。`,
    `我们的翻译引擎支持实时字幕，延迟控制在三百毫秒以内。`,
    `用户留存下降可能与 onboarding 流程过长有关，建议做 A/B 测试。`,
    `公司要求所有账号启用双因素认证，请在本月底前完成设置。`,
    `该算法在标准测试集上的准确率达到百分之九十二。`,
    `系统正在迁移到微服务架构，以提高扩展性和容错能力。`,
  ];
  return lines[seed % lines.length];
}

function enCulture(seed) {
  const lines = [
    `Could you tell me the historical background of this ancient bridge?`,
    `What customs should I be aware of during the Spring Festival visit?`,
    `This painting is remarkable. Who was the artist and when was it created?`,
    `I'm an exchange student. How can I join campus cultural activities?`,
    `At a formal Chinese dinner, where should the guest of honor sit?`,
    `We'd like to experience traditional tea ceremony. Do you offer guided sessions?`,
    `The guide mentioned this temple is over six hundred years old. Is that correct?`,
    `Can you explain the meaning behind this folk dance performance?`,
  ];
  return lines[seed % lines.length];
}

function zhCulture(seed) {
  const lines = [
    `这座古桥建于明代，是本地重要的文化遗产。`,
    `春节期间拜访亲友时，通常带一些水果或礼盒表达祝福。`,
    `这幅作品出自清代画家之手，距今已有两百多年历史。`,
    `留学生可以通过国际交流中心报名参加文化体验营。`,
    `正式宴请时，主位一般面向门口，贵宾坐在主人右侧。`,
    `茶馆每天下午三点有茶艺表演，可以现场体验泡茶流程。`,
    `这座寺庙始建于明朝，历经多次修缮仍保留原有风格。`,
    `这支民间舞蹈表达了丰收喜悦，已有数百年传承历史。`,
  ];
  return lines[seed % lines.length];
}

const EN_GETTERS = { daily: enDaily, medical: enMedical, legal: enLegal, tech: enTech, culture: enCulture };
const ZH_GETTERS = { daily: zhDaily, medical: zhMedical, legal: zhLegal, tech: zhTech, culture: zhCulture };

// Simple reference translations (template-based pairs)
function refEn2Zh(en, category, seed) {
  const refs = {
    daily: [
      "请问这个商品多少钱？上面没有价签。",
      "我想预订今晚七点的两人位。",
      "能帮我叫辆出租车吗？我需要在九点半之前赶到机场。",
      "我在网上办了入住，但还没拿到房卡。",
      "国际航班的行李提取处在哪里？",
      "我想开一个储蓄账户，需要带什么材料？",
      "我来取快递，单号在我手机上。",
      "这周末有什么游客可以参加的社区活动吗？",
    ],
    medical: [
      "我从昨天起喉咙痛还有点低烧，今天需要看医生吗？",
      "做常规体检需要预约吗，还是可以直接来？",
      "这药该怎么吃——饭前还是饭后？",
      "我的保险能报销这项血检吗？我有国际医疗保险。",
      "胸口疼痛时好时坏，大概持续了三天。",
      "我需要一份给雇主看的医疗证明，能开吗？",
      "这种疫苗适合五十岁以上成年人吗？我没有已知过敏。",
      "每次物理治疗大概要多长时间？",
    ],
    legal: [
      "我在申请工作签证，需要哪些支持材料？",
      "能用通俗的话解释一下这条关于解约通知的条款吗？",
      "雇主两个月没付加班费，我有哪些选择？",
      "签字前我想先看看租赁合同，有没有隐藏费用？",
      "我们在中国注册商标，流程大概要多久？",
      "我卷入一起轻微交通事故，应该先联系保险吗？",
      "这种商业交易里口头协议有法律效力吗？",
      "这些文件要在国外使用，需要公证，流程是什么？",
    ],
    tech: [
      "我们的新平台用机器学习来个性化推荐内容。",
      "同步数据时出现错误代码，能指导我排查吗？",
      "今天主题演讲将涵盖量子计算进展及其商业应用。",
      "我们正在寻求种子轮融资，把 AI 翻译服务推向全球。",
      "仪表盘显示留存率下降了百分之二十，需要分析用户行为。",
      "所有员工必须在本月底前启用双因素认证。",
      "该模型在基准数据集上准确率达到百分之九十二。",
      "我们正在迁移到微服务架构以提高系统可靠性。",
    ],
    culture: [
      "能介绍一下这座古桥的历史背景吗？",
      "春节期间拜访时有哪些需要注意的习俗？",
      "这幅画非常精彩，作者是谁？创作于何时？",
      "我是交换生，怎么参加校园文化活动？",
      "正式中式晚宴上，主宾应该坐在哪里？",
      "我们想体验传统茶道，有导览讲解吗？",
      "导游说这座寺庙有六百多年历史，对吗？",
      "能解释一下这场民间舞蹈表演的含义吗？",
    ],
  };
  const list = refs[category] || refs.daily;
  return list[seed % list.length];
}

function refZh2En(zh, category, seed) {
  const refs = {
    daily: [
      "This item is twenty percent off today, and members get an extra ten yuan discount.",
      "Your table is ready. Please follow me this way.",
      "It takes about fifteen minutes to the airport; there may be some traffic.",
      "Your room is on the twelfth floor. Here are your key card and breakfast voucher.",
      "International baggage claim is at carousel two; go straight to the end on the left.",
      "You need your ID and passport to open an account; bring the originals.",
      "Please show your pickup code and I'll get the package from the shelf.",
      "There's a calligraphy workshop this weekend; foreign friends can sign up too.",
    ],
    medical: [
      "Please fill out this triage form, have your temperature taken, then wait in internal medicine.",
      "Take this medicine three times a day, two tablets each time, half an hour after meals.",
      "Your test report will be ready tomorrow afternoon, or you can view it in the app.",
      "Most costs are covered by insurance; please pay the self-pay portion at the window.",
      "If symptoms worsen, such as difficulty breathing, come to the ER immediately.",
      "Drink plenty of water, get rest, and come back for a follow-up in three days.",
      "This tooth needs further treatment; I'll relieve the pain first.",
      "Rehab sessions are twice a week, about forty-five minutes each.",
    ],
    legal: [
      "A work visa requires an employer invitation letter and a valid passport.",
      "This clause means either party may terminate with thirty days' written notice.",
      "You can file a complaint with labor authorities or apply for arbitration.",
      "The deposit is usually one month's rent and is returned after move-out inspection.",
      "Trademark registration typically takes one to two years; a similarity search is recommended.",
      "For minor accidents, take photos for evidence and notify your insurer promptly.",
      "Important business contracts should be in writing; oral agreements are hard to prove.",
      "Bring originals and copies for notarization; translations must be certified.",
    ],
    tech: [
      "The new version adds speech recognition supporting mixed Chinese-English input.",
      "Check your network, clear cache, then log in again.",
      "This afternoon's forum will discuss LLM applications in medical diagnosis.",
      "Our translation engine supports real-time subtitles with latency under 300 ms.",
      "The retention drop may relate to a long onboarding flow; consider A/B testing.",
      "All accounts must enable two-factor authentication by month end.",
      "The algorithm achieves ninety-two percent accuracy on the standard test set.",
      "The system is migrating to microservices for better scalability and fault tolerance.",
    ],
    culture: [
      "This ancient bridge was built in the Ming Dynasty and is an important local heritage site.",
      "When visiting during Spring Festival, people usually bring fruit or gift boxes as blessings.",
      "This work is by a Qing Dynasty painter and is over two hundred years old.",
      "Exchange students can sign up for cultural camps through the international office.",
      "At formal banquets, the host seat faces the door; the guest of honor sits to the host's right.",
      "There's a tea ceremony demo daily at 3 p.m.; you can try brewing on site.",
      "The temple dates to the Ming Dynasty and retains its original style after many renovations.",
      "This folk dance expresses joy of harvest and has been passed down for centuries.",
    ],
  };
  const list = refs[category] || refs.daily;
  return list[seed % list.length];
}

function extractKeyPoints(text, lang) {
  if (lang === "zh") {
    const parts = text.split(/[，。！？、]/).filter((s) => s.trim().length >= 2);
    return parts.slice(0, 4).map((s) => s.trim());
  }
  const parts = text.split(/[,.!?]/).filter((s) => s.trim().length > 3);
  const words = text.match(/\b[\w']+\b/g) || [];
  const kp = parts.slice(0, 2).map((s) => s.trim());
  if (words.length >= 4) kp.push(words.slice(0, 3).join(" "));
  return kp.slice(0, 4);
}

function generateCorpus(targetCount = 8200) {
  const utterances = [];
  let id = 1;
  let convId = 1;

  while (utterances.length < targetCount) {
    const catKeys = Object.keys(CATEGORIES);
    const catKey = catKeys[convId % catKeys.length];
    const cat = CATEGORIES[catKey];
    const scenario = pick(cat.scenarios, convId);
    const level = pick(LEVELS, convId);
    const turnsCount = 4 + (convId % 3); // 4-6 turns per conversation
    const conversationId = `${catKey}-${String(convId).padStart(5, "0")}`;

    for (let t = 0; t < turnsCount && utterances.length < targetCount; t++) {
      const isForeigner = t % 2 === 0;
      const seed = convId * 17 + t * 31 + utterances.length;
      const lineSeed = seed % 8;

      if (isForeigner) {
        const sourceText = EN_GETTERS[catKey](lineSeed, scenario) + (seed % 5 === 0 ? ` (${scenario})` : "");
        const reference = refEn2Zh(sourceText, catKey, lineSeed);
        utterances.push({
          id,
          conversationId,
          turn: t + 1,
          totalTurns: turnsCount,
          category: catKey,
          categoryLabel: cat.label,
          scenario,
          speaker: "foreigner",
          speakerLabel: pick(FOREIGNERS, seed),
          speakerRole: "外国人",
          direction: "en2zh",
          directionLabel: "英译中",
          level: level.id,
          levelLabel: level.label,
          sourceText,
          reference,
          keyPoints: extractKeyPoints(reference, "zh"),
        });
      } else {
        const sourceText = ZH_GETTERS[catKey](lineSeed, scenario) + (seed % 7 === 0 ? `（${scenario}）` : "");
        const reference = refZh2En(sourceText, catKey, lineSeed);
        utterances.push({
          id,
          conversationId,
          turn: t + 1,
          totalTurns: turnsCount,
          category: catKey,
          categoryLabel: cat.label,
          scenario,
          speaker: "local",
          speakerLabel: pick(LOCALS, seed),
          speakerRole: "中国人",
          direction: "zh2en",
          directionLabel: "中译英",
          level: level.id,
          levelLabel: level.label,
          sourceText,
          reference,
          keyPoints: extractKeyPoints(reference, "en"),
        });
      }
      id++;
    }
    convId++;
  }

  return utterances;
}

const corpus = generateCorpus(8200);
const outDir = path.join(__dirname, "..", "public", "data");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "corpus.json");

fs.writeFileSync(
  outPath,
  JSON.stringify({
    version: 2,
    generatedAt: new Date().toISOString(),
    totalUtterances: corpus.length,
    totalConversations: new Set(corpus.map((u) => u.conversationId)).size,
    categories: Object.entries(CATEGORIES).map(([k, v]) => ({ id: k, label: v.label })),
    utterances: corpus,
  })
);

console.log(`Generated ${corpus.length} utterances → ${outPath}`);
console.log(`Conversations: ${new Set(corpus.map((u) => u.conversationId)).size}`);
