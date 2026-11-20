// 张雨生答案之书
// 流程：选答案库（100 / 1000）-> 输入问题 -> 掷骰子（六面骰转动）-> 点停 -> 出对应号 -> 取对应答案
// 界面与答案库均可切换简体 / 繁体（繁体答案库由简体库经 OpenCC s2t 预生成）
(function () {
  var FACES = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  var STR = {
    cn: {
      docTitle: '张雨生答案之书 — 宝友问，宝哥答',
      siteTitle: '张雨生答案之书',
      siteSubtitle: '写下你的问题，掷骰子，听宝哥回答',
      heroLine: '“倘若源自心灵，不过诚实而已。”',
      heroNote: '——宝哥',
      choiceLabel: '先选答案库：',
      choiceNote100: '100条经典歌词',
      choiceNote1000: '1000条：歌词944条 + 雨生亲笔文字56条',
      choiceNoteLoading: '1000答案库加载中……',
      choiceNoteFail: '1000答案库没加载出来，刷新一下页面再试。',
      askLabel: '你的问题',
      questionPlaceholder: '宝友，你想问什么？比如：我该怎么办，喜欢他，却不敢说',
      questionHint: '先写下你的问题，再掷骰子。',
      rollBtn: '掷骰子',
      diceRolling: '骰子在转……想好了就点停。',
      diceStop: '停！看看是第几号答案……',
      diceDone: '宝哥已经回答了。',
      loadFail: '答案库没加载出来，刷新一下页面再试。',
      stopBtn: '停',
      numberUnit: '号',
      whoQ: '宝友问：',
      whoA: '宝哥答：',
      againBtn: '再问一次',
      answerSuffix: '号答案',
      footer1: '这里是宝友的答案之书：写下你的问题，掷一枚骰子，听宝哥用张雨生自己的话作答。',
      footer2: '答案库两种选择：100条经典歌词，或1000条（歌词944条 + 雨生亲笔文字56条）',
      footer3Text: '雨生亲笔文字已收入1000答案版',
      footer4: '整部作品由宝友Ellen提议，宝友群集思广益，Muse AI生成。',
      footer5: '头像：宝友「哈哈」手绘作品，Muse AI涂色。'
    },
    tw: {
      docTitle: '張雨生答案之書 — 寶友問，寶哥答',
      siteTitle: '張雨生答案之書',
      siteSubtitle: '寫下你的問題，擲骰子，聽寶哥回答',
      heroLine: '“倘若源自心靈，不過誠實而已。”',
      heroNote: '——寶哥',
      choiceLabel: '先選答案庫：',
      choiceNote100: '100條經典歌詞',
      choiceNote1000: '1000條：歌詞944條 + 雨生親筆文字56條',
      choiceNoteLoading: '1000答案庫加載中……',
      choiceNoteFail: '1000答案庫沒加載出來，刷新一下頁面再試。',
      askLabel: '你的問題',
      questionPlaceholder: '寶友，你想問什麼？比如：我該怎麼辦，喜歡他，卻不敢說',
      questionHint: '先寫下你的問題，再擲骰子。',
      rollBtn: '擲骰子',
      diceRolling: '骰子在轉……想好了就點停。',
      diceStop: '停！看看是第幾號答案……',
      diceDone: '寶哥已經回答了。',
      loadFail: '答案庫沒加載出來，刷新一下頁面再試。',
      stopBtn: '停',
      numberUnit: '號',
      whoQ: '寶友問：',
      whoA: '寶哥答：',
      againBtn: '再問一次',
      answerSuffix: '號答案',
      footer1: '這裡是寶友的答案之書：寫下你的問題，擲一枚骰子，聽寶哥用張雨生自己的話作答。',
      footer2: '答案庫兩種選擇：100條經典歌詞，或1000條（歌詞944條 + 雨生親筆文字56條）',
      footer3Text: '雨生親筆文字已收入1000答案版',
      footer4: '整部作品由寶友Ellen提議，寶友群集思廣益，Muse AI生成。',
      footer5: '頭像：寶友「哈哈」手繪作品，Muse AI塗色。'
    }
  };

  function $(id) { return document.getElementById(id); }

  var questionEl = $('question');
  var questionHint = $('questionHint');
  var rollBtn = $('rollBtn');
  var diceArea = $('diceArea');
  var dieEl = $('die');
  var diceStatus = $('diceStatus');
  var stopBtn = $('stopBtn');
  var numberLine = $('numberLine');
  var answerNumber = $('answerNumber');
  var answerSection = $('answerSection');
  var askedQuestion = $('askedQuestion');
  var answerText = $('answerText');
  var answerSource = $('answerSource');
  var againBtn = $('againBtn');
  var mode100Btn = $('mode100Btn');
  var mode1000Btn = $('mode1000Btn');
  var choiceNote = $('choiceNote');
  var langBtn = $('langBtn');

  var pips = Array.prototype.slice.call(dieEl.querySelectorAll('.pip'));
  var mode = 100;
  var lang = 'cn';
  try {
    var saved = localStorage.getItem('yusheng-lang');
    if (saved === 'tw' || saved === 'cn') lang = saved;
  } catch (e) {}
  var pools = {};
  var answers = null;
  var lastN = 0;
  var rollTimer = null;
  var numberTimer = null;

  function S() { return STR[lang]; }

  function showFace(n) {
    var on = FACES[n] || [];
    pips.forEach(function (pip, i) {
      pip.classList.toggle('on', on.indexOf(i) !== -1);
    });
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function poolFile(m, l) {
    if (m === 100) return l === 'tw' ? 'answers-tw.json' : 'answers.json';
    return l === 'tw' ? 'answers-1000-tw.json' : 'answers-1000.json';
  }

  function loadPool(m, l, cb) {
    var key = m + '-' + l;
    if (pools[key]) { cb(pools[key]); return; }
    fetch(poolFile(m, l))
      .then(function (r) { return r.json(); })
      .then(function (data) { pools[key] = data; cb(data); })
      .catch(function () { cb(null); });
  }

  function applyLangStrings() {
    var s = S();
    document.title = s.docTitle;
    document.documentElement.lang = lang === 'tw' ? 'zh-TW' : 'zh-CN';
    $('siteTitle').textContent = s.siteTitle;
    $('siteSubtitle').textContent = s.siteSubtitle;
    $('heroLine').textContent = s.heroLine;
    $('heroNote').textContent = s.heroNote;
    $('choiceLabel').textContent = s.choiceLabel;
    $('askLabel').textContent = s.askLabel;
    questionEl.placeholder = s.questionPlaceholder;
    questionHint.textContent = s.questionHint;
    rollBtn.textContent = s.rollBtn;
    stopBtn.textContent = s.stopBtn;
    $('numberUnit').textContent = s.numberUnit;
    $('whoQ').textContent = s.whoQ;
    $('whoA').textContent = s.whoA;
    againBtn.textContent = s.againBtn;
    $('footer1').textContent = s.footer1;
    $('footer2').textContent = s.footer2;
    $('footer3Text').textContent = s.footer3Text;
    $('footer4').textContent = s.footer4;
    $('footer5').textContent = s.footer5;
    langBtn.textContent = lang === 'cn' ? '繁體' : '简体';
    if (diceArea.hidden) diceStatus.textContent = s.diceRolling;
    updateChoiceNote();
  }

  function updateChoiceNote() {
    choiceNote.textContent = mode === 1000 ? S().choiceNote1000 : S().choiceNote100;
  }

  function resetFlow() {
    answerSection.hidden = true;
    diceArea.hidden = true;
    numberLine.hidden = true;
    rollBtn.disabled = false;
  }

  function renderAnswer(n) {
    if (!answers || !answers.length) return;
    var item = answers[(n - 1) % answers.length];
    var src = item.source || ('《' + item.song + '》/《' + item.album + '》');
    answerText.textContent = item.text;
    answerSource.textContent = '——' + src + ' · 第' + n + S().answerSuffix;
  }

  function setMode(n) {
    if (n === mode && answers) return;
    if (n === 1000 && !pools['1000-' + lang]) {
      mode100Btn.disabled = true;
      mode1000Btn.disabled = true;
      choiceNote.textContent = S().choiceNoteLoading;
    }
    loadPool(n, lang, function (data) {
      mode100Btn.disabled = false;
      mode1000Btn.disabled = false;
      if (!data) {
        choiceNote.textContent = S().choiceNoteFail;
        return;
      }
      mode = n;
      answers = data;
      mode100Btn.classList.toggle('active', n === 100);
      mode1000Btn.classList.toggle('active', n === 1000);
      updateChoiceNote();
      resetFlow();
    });
  }

  function setLang(newLang) {
    if (newLang === lang) return;
    var prevLang = lang;
    lang = newLang;
    try { localStorage.setItem('yusheng-lang', newLang); } catch (e) {}
    applyLangStrings();
    rollBtn.disabled = true;
    loadPool(mode, lang, function (data) {
      if (!data) {
        lang = prevLang;
        try { localStorage.setItem('yusheng-lang', prevLang); } catch (e) {}
        applyLangStrings();
        diceStatus.textContent = S().loadFail;
        rollBtn.disabled = false;
        return;
      }
      answers = data;
      rollBtn.disabled = false;
      if (!answerSection.hidden && lastN > 0) renderAnswer(lastN);
    });
  }

  mode100Btn.addEventListener('click', function () { setMode(100); });
  mode1000Btn.addEventListener('click', function () { setMode(1000); });
  langBtn.addEventListener('click', function () {
    setLang(lang === 'cn' ? 'tw' : 'cn');
  });

  applyLangStrings();
  loadPool(100, lang, function (data) {
    if (data) { answers = data; return; }
    diceStatus.textContent = S().loadFail;
  });

  rollBtn.addEventListener('click', function () {
    var q = questionEl.value.trim();
    if (!q) {
      questionHint.hidden = false;
      questionEl.focus();
      return;
    }
    if (!answers || !answers.length) {
      diceStatus.textContent = S().loadFail;
      return;
    }
    questionHint.hidden = true;
    answerSection.hidden = true;
    numberLine.hidden = true;
    diceArea.hidden = false;
    rollBtn.disabled = true;
    stopBtn.disabled = false;
    diceStatus.textContent = S().diceRolling;
    dieEl.classList.add('rolling');
    rollTimer = setInterval(function () { showFace(randInt(1, 6)); }, 90);
    diceArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  stopBtn.addEventListener('click', function () {
    if (!rollTimer) return;
    clearInterval(rollTimer);
    rollTimer = null;
    stopBtn.disabled = true;
    dieEl.classList.remove('rolling');
    showFace(randInt(1, 6));
    diceStatus.textContent = S().diceStop;

    // 数字 1-mode 快速闪动后定格
    var ticks = 0;
    numberLine.hidden = false;
    numberTimer = setInterval(function () {
      answerNumber.textContent = randInt(1, mode);
      ticks++;
      if (ticks > 12) {
        clearInterval(numberTimer);
        numberTimer = null;
        revealAnswer();
      }
    }, 60);
  });

  function revealAnswer() {
    if (!answers || !answers.length) {
      diceStatus.textContent = S().loadFail;
      rollBtn.disabled = false;
      return;
    }
    var n = parseInt(answerNumber.textContent, 10);
    lastN = n;
    askedQuestion.textContent = questionEl.value.trim();
    renderAnswer(n);
    answerSection.hidden = false;
    diceStatus.textContent = S().diceDone;
    answerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  againBtn.addEventListener('click', function () {
    answerSection.hidden = true;
    diceArea.hidden = true;
    numberLine.hidden = true;
    rollBtn.disabled = false;
    questionEl.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
