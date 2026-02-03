// ============================================================================
// NOTEBOOK FIX - Erweitert Notizen-Speicherung für alle Felder
// ============================================================================

(() => {
  console.log('[NOTEBOOK FIX] Erweitere Notizen-Speicherung...');
  
  const $ = (s) => document.querySelector(s);
  
  // Alle Notizen-Felder (inkl. die fehlenden)
  const allNotebookFields = [
    "nbQuestions",      // Fragen an Chef/Ausbilder
    "nbVocabulary",     // Fachbegriffe
    "nbRecipes",        // Rezepte/Grundansätze
    "nbServiceLessons", // Service-Lektionen
    "nbGoals",
    "nbMeat",
    "nbFish",
    "nbVeg",
    "nbSauces",
    "nbBakery",
    "nbHygiene",
    "nbKnife",
    "nbStations",
    "nbPlating"
  ];
  
  // Hilfsfunktionen
  const val = (el) => el?.value || "";
  const setVal = (el, v) => { if (el) el.value = v || ""; };
  const nowISO = () => new Date().toISOString();
  
  // Store-Zugriff
  const getStore = () => {
    try {
      const raw = localStorage.getItem('azubi_tagebuch_v3');
      return raw ? JSON.parse(raw) : { version: 3, years: {} };
    } catch (e) {
      console.error('[NOTEBOOK FIX] Fehler beim Laden:', e);
      return { version: 3, years: {} };
    }
  };
  
  const saveStore = (store) => {
    try {
      store.updatedAt = nowISO();
      localStorage.setItem('azubi_tagebuch_v3', JSON.stringify(store, null, 2));
    } catch (e) {
      console.error('[NOTEBOOK FIX] Fehler beim Speichern:', e);
    }
  };
  
  const yData = () => {
    const store = getStore();
    const year = store.yearActive || "1";
    if (!store.years[year]) store.years[year] = {};
    return store.years[year];
  };
  
  // Toast-Nachricht
  const toast = (msg) => {
    if (typeof window.toast === 'function') {
      window.toast(msg);
      return;
    }
    let t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = `
      position: fixed;
      left: 50%;
      bottom: 82px;
      transform: translateX(-50%);
      background: rgba(26,26,26,.86);
      color: rgba(238,236,228,.96);
      padding: 10px 14px;
      border-radius: 999px;
      font-weight: 900;
      box-shadow: 0 10px 30px rgba(0,0,0,.12);
      z-index: 99;
    `;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  };
  
  // Lade Notizen
  const hydrateNotebook = () => {
    const data = yData();
    const notebook = data.notebook || {};
    
    allNotebookFields.forEach(id => {
      const el = $("#" + id);
      if (el) {
        setVal(el, notebook[id] || "");
      }
    });
    
    console.log('[NOTEBOOK FIX] Notizen geladen:', Object.keys(notebook).length, 'Felder');
  };
  
  // Speichere Notizen
  const saveNotebook = () => {
    const data = yData();
    const notebook = {};
    
    allNotebookFields.forEach(id => {
      const el = $("#" + id);
      if (el) {
        const value = val(el);
        if (value) { // Nur speichern wenn nicht leer
          notebook[id] = value;
        }
      }
    });
    
    notebook.savedAt = nowISO();
    data.notebook = notebook;
    
    const store = getStore();
    const year = store.yearActive || "1";
    store.years[year] = data;
    saveStore(store);
    
    toast("Notizbuch gespeichert! ✓");
    console.log('[NOTEBOOK FIX] Notizen gespeichert:', Object.keys(notebook).length, 'Felder');
  };
  
  // Event Listener für Speichern-Button
  const btnSave = $("#btnSaveNotebook");
  if (btnSave) {
    // Entferne alte Listener (falls vorhanden)
    const newBtn = btnSave.cloneNode(true);
    btnSave.parentNode.replaceChild(newBtn, btnSave);
    
    // Neuer Listener
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      saveNotebook();
    });
    
    console.log('[NOTEBOOK FIX] Speichern-Button verbunden');
  }
  
  // Auto-Save bei Eingabe (nach 2 Sekunden Inaktivität)
  let autoSaveTimer = null;
  const setupAutoSave = () => {
    allNotebookFields.forEach(id => {
      const el = $("#" + id);
      if (el) {
        el.addEventListener("input", () => {
          clearTimeout(autoSaveTimer);
          autoSaveTimer = setTimeout(() => {
            saveNotebook();
            console.log('[NOTEBOOK FIX] Auto-Save ausgeführt');
          }, 2000);
        });
      }
    });
    console.log('[NOTEBOOK FIX] Auto-Save aktiviert');
  };
  
  // Lade Notizen beim Tab-Wechsel
  const observeTabSwitch = () => {
    const notebookPanel = $("#panelNotebook");
    if (!notebookPanel) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (notebookPanel.classList.contains('is-active')) {
            hydrateNotebook();
            console.log('[NOTEBOOK FIX] Notizen-Tab aktiviert, Daten geladen');
          }
        }
      });
    });
    
    observer.observe(notebookPanel, { attributes: true });
  };
  
  // Initialisierung
  const init = () => {
    hydrateNotebook();
    setupAutoSave();
    observeTabSwitch();
    console.log('[NOTEBOOK FIX] Initialisierung abgeschlossen');
  };
  
  // Warte auf DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
  
  // Exportiere Funktionen
  window.notebookFix = {
    save: saveNotebook,
    load: hydrateNotebook
  };
  
})();
