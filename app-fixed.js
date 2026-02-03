// FIX: Diese Datei enthält nur die Korrektur für den Quiz-Syntax-Fehler
// Sie muss NACH app.js geladen werden

(() => {
  console.log('[FIX] Quiz-Funktion wird repariert...');
  
  // Die Quiz-Funktion wurde in app.js nicht korrekt geschlossen
  // Wir initialisieren sie hier neu
  
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  
  const escapeHTML = (s) => String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  
  const toast = (msg) => {
    if (typeof window.toast === 'function') {
      window.toast(msg);
      return;
    }
    let t = $("#__toast");
    if (!t){
      t = document.createElement("div");
      t.id="__toast_fix";
      t.style.cssText="position:fixed;left:12px;bottom:12px;z-index:9999;padding:10px 12px;border-radius:12px;background:rgba(20,22,27,.92);color:#fff;font:14px/1.25 system-ui, -apple-system, Segoe UI, Roboto, Arial;box-shadow:0 10px 30px rgba(0,0,0,.2);max-width:min(520px, calc(100vw - 24px));";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity="1";
    clearTimeout(window.__toastTimer);
    window.__toastTimer=setTimeout(()=>{ t.style.opacity="0"; }, 1600);
  };
  
  // Glossar-Pool abrufen
  const getGlossaryPool = () => {
    const g = window.AZUBI_GLOSSARY_PRO?.items || [];
    return g;
  };
  
  // Quiz-Funktionalität
  const quiz = (() => {
    const els = {
      status: $("#quizStatusPill"),
      reset: $("#quizReset"),
      home: $("#quizHome"),
      year: $("#quizYear"),
      count: $("#quizCount"),
      start: $("#quizStart"),
      onlyWrong: $("#quizOnlyWrong"),
      run: $("#quizRun"),
      name: $("#quizName"),
      progress: $("#quizProgress"),
      score: $("#quizScore"),
      abort: $("#quizAbort"),
      meta: $("#quizQMeta"),
      text: $("#quizQText"),
      choices: $("#quizChoices"),
      feedback: $("#quizFeedback"),
      next: $("#quizNext"),
    };

    let pool = [];
    let deck = [];
    let i = 0;
    let score = 0;
    let wrong = [];

    const buildPool = (ySel) => {
      const g = getGlossaryPool();
      if (ySel === "all") return g.slice();
      const y = Number(ySel);
      return g.filter(it => (it.years||[]).includes(y));
    };

    const makeQuestion = (item) => {
      const correct = item.definition || "";
      const distract = pool
        .filter(x => x.term !== item.term && x.definition && x.definition !== correct)
        .sort(()=>Math.random()-0.5)
        .slice(0,3)
        .map(x => x.definition);

      const choices = [correct, ...distract].sort(()=>Math.random()-0.5);
      return { term: item.term, correct, choices };
    };

    const render = () => {
      const q = deck[i];
      if (!q) return finish();
      
      if (els.run) {
        els.run.style.display = 'block';
        els.run.classList.add("is-on");
      }
      if (els.home) els.home.style.display = 'none';
      
      if (els.name) els.name.textContent = "Quiz";
      if (els.progress) els.progress.textContent = `${i+1}/${deck.length}`;
      if (els.score) els.score.textContent = `${score}`;
      if (els.meta) els.meta.textContent = "";
      if (els.text) els.text.textContent = q.term;
      if (els.feedback) {
        els.feedback.textContent = "";
        els.feedback.style.display = "none";
      }
      if (els.next) els.next.disabled = true;
      
      if (els.choices) {
        els.choices.innerHTML = q.choices.map((c,idx)=>(
          `<button type="button" class="choice" data-ans="${escapeHTML(c)}">${escapeHTML(c)}</button>`
        )).join("");
      }
    };

    const answer = (ans) => {
      const q = deck[i];
      if (!q) return;
      const ok = ans === q.correct;
      if (ok) score += 1; else wrong.push(q);
      if (els.feedback) {
        els.feedback.textContent = ok ? "✅ Richtig." : `❌ Falsch. Richtig: ${q.correct}`;
        els.feedback.style.display = "block";
      }
      // disable choices
      $$(".choice", els.choices).forEach(b => b.disabled = true);
      if (els.next) els.next.disabled = false;
    };

    const next = () => {
      i += 1;
      render();
    };

    const finish = () => {
      if (els.text) els.text.textContent = "Fertig.";
      if (els.choices) els.choices.innerHTML = "";
      if (els.feedback) {
        els.feedback.textContent = `Score: ${score}/${deck.length}`;
        els.feedback.style.display = "block";
      }
      if (els.progress) els.progress.textContent = `${deck.length}/${deck.length}`;
      toast(`Quiz beendet! Score: ${score}/${deck.length}`);
    };

    const start = (onlyWrong=false) => {
      // Hole Store
      const store = JSON.parse(localStorage.getItem('azubi_tagebuch_v3') || '{}');
      const ySel = els.year?.value || store.yearActive || "1";
      pool = buildPool(ySel);
      const n = Number(els.count?.value || 20);

      const base = onlyWrong ? wrong : pool;
      wrong = [];

      deck = base
        .sort(()=>Math.random()-0.5)
        .slice(0, Math.min(n, base.length))
        .map(makeQuestion);

      i = 0; score = 0;
      render();
      if (els.status) els.status.textContent = "Läuft";
      toast("Quiz gestartet!");
    };

    const reset = (toastIt=true) => {
      pool = []; deck = []; i = 0; score = 0; wrong = [];
      if (els.run) {
        els.run.classList.remove("is-on");
        els.run.style.display = 'none';
      }
      if (els.home) els.home.style.display = 'block';
      if (els.status) els.status.textContent = "Bereit";
      if (toastIt) toast("Quiz zurückgesetzt.");
    };

    // Event Listeners
    if (els.start) {
      els.start.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        start(false);
      });
    }
    
    if (els.onlyWrong) {
      els.onlyWrong.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        start(true);
      });
    }
    
    if (els.next) {
      els.next.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        next();
      });
    }
    
    if (els.abort) {
      els.abort.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        reset();
      });
    }
    
    if (els.reset) {
      els.reset.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        reset();
      });
    }

    if (els.choices) {
      els.choices.addEventListener("click", (e) => {
        const b = e.target.closest("button.choice");
        if (!b || b.disabled) return;
        e.preventDefault();
        e.stopPropagation();
        answer(b.dataset.ans);
      });
    }

    // Initial state
    reset(false);

    return { start, reset };
  })();

  // Exportiere Quiz global
  window.quizFixed = quiz;
  
  console.log('[FIX] Quiz-Funktion erfolgreich repariert!');
})();
