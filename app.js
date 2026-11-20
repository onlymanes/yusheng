// 张雨生答案之书 V0
// 流程：输入问题 -> 掷骰子（六面骰转动）-> 点停 -> 出 1-100 的号 -> 取对应答案
(function () {
  var FACES = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  var questionEl = document.getElementById('question');
  var questionHint = document.getElementById('questionHint');
  var rollBtn = document.getElementById('rollBtn');
  var diceArea = document.getElementById('diceArea');
  var dieEl = document.getElementById('die');
  var diceStatus = document.getElementById('diceStatus');
  var stopBtn = document.getElementById('stopBtn');
  var numberLine = document.getElementById('numberLine');
  var answerNumber = document.getElementById('answerNumber');
  var answerSection = document.getElementById('answerSection');
  var askedQuestion = document.getElementById('askedQuestion');
  var answerText = document.getElementById('answerText');
  var answerSource = document.getElementById('answerSource');
  var againBtn = document.getElementById('againBtn');

  var pips = Array.prototype.slice.call(dieEl.querySelectorAll('.pip'));
  var answers = null;
  var rollTimer = null;
  var numberTimer = null;

  function showFace(n) {
    var on = FACES[n] || [];
    pips.forEach(function (pip, i) {
      pip.classList.toggle('on', on.indexOf(i) !== -1);
    });
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  fetch('answers.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { answers = data; })
    .catch(function () {
      diceStatus.textContent = '答案库没加载出来，刷新一下页面再试。';
    });

  rollBtn.addEventListener('click', function () {
    var q = questionEl.value.trim();
    if (!q) {
      questionHint.hidden = false;
      questionEl.focus();
      return;
    }
    questionHint.hidden = true;
    answerSection.hidden = true;
    numberLine.hidden = true;
    diceArea.hidden = false;
    rollBtn.disabled = true;
    stopBtn.disabled = false;
    diceStatus.textContent = '骰子在转……想好了就点停。';
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
    diceStatus.textContent = '停！看看是第几号答案……';

    // 数字 1-100 快速闪动后定格
    var ticks = 0;
    numberLine.hidden = false;
    numberTimer = setInterval(function () {
      answerNumber.textContent = randInt(1, 100);
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
      diceStatus.textContent = '答案库没加载出来，刷新一下页面再试。';
      rollBtn.disabled = false;
      return;
    }
    var n = parseInt(answerNumber.textContent, 10);
    var item = answers[(n - 1) % answers.length];
    askedQuestion.textContent = questionEl.value.trim();
    answerText.textContent = item.text;
    answerSource.textContent = '——《' + item.song + '》/《' + item.album + '》 · 第 ' + n + ' 号答案';
    answerSection.hidden = false;
    diceStatus.textContent = '宝哥已经回答了。';
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
