// ============================================================================
//  SAISON-KALENDER: Obst & Gemüse (DACH-Region)
// ============================================================================

(function() {
  'use strict';

  let gemueseData = null;
  let obstData = null;
  let kraeuterData = null;
  let currentMonth = new Date().getMonth() + 1; // 1-12
  let currentCategory = 'gemuese'; // gemuese, obst, kraeuter

  const monthKeys = [
    'januar', 'februar', 'maerz', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'dezember'
  ];

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // ========================================================================
  // DATA LOADING
  // ========================================================================
  
  const loadData = async () => {
    try {
      console.log('[Saison] Lade Daten...');
      
      const [gemueseResp, obstResp, kraeuterResp] = await Promise.all([
        fetch('gemuese_monate.json'),
        fetch('obst_monate.json'),
        fetch('kraeuter_monate.json')
      ]);
      
      if (!gemueseResp.ok || !obstResp.ok || !kraeuterResp.ok) {
        throw new Error('Fehler beim Laden der Dateien');
      }
      
      gemueseData = await gemueseResp.json();
      obstData = await obstResp.json();
      kraeuterData = await kraeuterResp.json();
      
      console.log('[Saison] Daten geladen:', {
        gemuese: gemueseData ? 'OK' : 'FEHLER',
        obst: obstData ? 'OK' : 'FEHLER',
        kraeuter: kraeuterData ? 'OK' : 'FEHLER'
      });
      
      return true;
    } catch(e) {
      console.error('[Saison] Fehler beim Laden:', e);
      return false;
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  
  const render = () => {
    const container = document.getElementById('saisonContent');
    if (!container) {
      console.error('[Saison] Container #saisonContent nicht gefunden');
      return;
    }

    const monthKey = monthKeys[currentMonth - 1];
    const monthName = monthNames[currentMonth - 1];
    
    console.log('[Saison] Render:', {
      category: currentCategory,
      month: currentMonth,
      monthKey: monthKey,
      monthName: monthName
    });

    let data;
    if (currentCategory === 'gemuese') data = gemueseData;
    else if (currentCategory === 'obst') data = obstData;
    else if (currentCategory === 'kraeuter') data = kraeuterData;
    
    if (!data || !data[monthKey]) {
      container.innerHTML = `<div class="saisonEmpty">Keine Daten für ${monthName} verfügbar.</div>`;
      return;
    }

    const monthData = data[monthKey];
    let items;
    if (currentCategory === 'gemuese') items = monthData.gemuese;
    else if (currentCategory === 'obst') items = monthData.obst;
    else if (currentCategory === 'kraeuter') items = monthData.kraeuter;
    
    if (!items || items.length === 0) {
      container.innerHTML = `<div class="saisonEmpty">Keine Einträge für ${monthName}.</div>`;
      return;
    }

    console.log('[Saison] Gefunden:', items.length, 'Einträge');

    const html = items.map(item => {
      const hochsaison = item.hochsaison ? '⭐ Hochsaison' : '';
      const herkunft = item.herkunft || 'k.A.';
      const lagerung = item.lagerung_c ? `${item.lagerung_c}°C` : 'k.A.';
      const haltbar = item.haltbar_wo ? `${item.haltbar_wo} Wochen` : 'k.A.';
      const gerichte = item.gerichte ? item.gerichte.slice(0, 3).join(', ') : '';
      
      return `
        <div class="saisonCard">
          <div class="saisonCard__header">
            <div class="saisonCard__title">${escapeHtml(item.name)}</div>
            <div class="saisonCard__badges">
              ${hochsaison ? `<span class="badge badge--hochsaison">${hochsaison}</span>` : ''}
            </div>
          </div>
          <div class="saisonCard__meta">
            <div><strong>Familie:</strong> ${escapeHtml(item.familie || 'k.A.')}</div>
            <div><strong>Herkunft:</strong> ${escapeHtml(herkunft)}</div>
            <div><strong>Lagerung:</strong> ${lagerung} · Haltbar: ${haltbar}</div>
          </div>
          ${gerichte ? `
            <div class="saisonCard__gerichte">
              <strong>Gerichte:</strong> ${escapeHtml(gerichte)}
            </div>
          ` : ''}
          ${item.verarbeitung ? `
            <div class="saisonCard__info">
              <strong>Verarbeitung:</strong> ${escapeHtml(item.verarbeitung)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  const setMonth = (month) => {
    currentMonth = parseInt(month);
    console.log('[Saison] Monat gewechselt:', monthNames[currentMonth - 1]);
    updateMonthButtons();
    render();
  };

  const setCategory = (category) => {
    currentCategory = category;
    console.log('[Saison] Kategorie gewechselt:', category);
    updateCategoryButtons();
    render();
  };

  const updateMonthButtons = () => {
    document.querySelectorAll('.saisonMonthBtn').forEach(btn => {
      btn.classList.toggle('is-active', parseInt(btn.dataset.month) === currentMonth);
    });
  };

  const updateCategoryButtons = () => {
    document.querySelectorAll('.saisonCategoryBtn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.category === currentCategory);
    });
  };

  // ========================================================================
  // INIT
  // ========================================================================
  
  const init = async () => {
    console.log('[Saison] Initialisierung gestartet...');
    
    const success = await loadData();
    
    if (!success) {
      const container = document.getElementById('saisonContent');
      if (container) {
        container.innerHTML = '<div class="saisonEmpty">❌ Fehler beim Laden der Daten. Bitte Konsole prüfen.</div>';
      }
      return;
    }
    
    // Month buttons
    document.querySelectorAll('.saisonMonthBtn').forEach(btn => {
      btn.addEventListener('click', () => setMonth(btn.dataset.month));
    });

    // Category buttons
    document.querySelectorAll('.saisonCategoryBtn').forEach(btn => {
      btn.addEventListener('click', () => setCategory(btn.dataset.category));
    });

    updateMonthButtons();
    updateCategoryButtons();
    render();
    
    console.log('[Saison] ✅ Initialisierung abgeschlossen');
  };

  // Export
  window.SaisonKalender = {
    init,
    setMonth,
    setCategory,
    render
  };

  // Auto-init when tab is clicked
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab="saison"]');
    if (tab && !window.__SAISON_INITIALIZED__) {
      console.log('[Saison] 🌱 Tab geklickt, starte Init');
      window.__SAISON_INITIALIZED__ = true;
      setTimeout(() => init(), 100);
    }
  });

})();
