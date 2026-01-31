// ============================================================================
//  SAISON-KALENDER: Obst, Gemüse, Kräuter (DACH-Region)
// ============================================================================

(function() {
  'use strict';

  let obstData = [];
  let gemueseData = [];
  let kraeuterData = [];
  let currentMonth = new Date().getMonth() + 1; // 1-12
  let currentCategory = 'obst'; // obst, gemuese, kraeuter

  const monthNames = [
    'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // ========================================================================
  // DATA LOADING
  // ========================================================================
  
  const loadData = async () => {
    try {
      const [obst, gemuese, kraeuter] = await Promise.all([
        fetch('obst_saison_dach.json').then(r => r.json()),
        fetch('gemuese_saison_dach.json').then(r => r.json()),
        fetch('kraeuter_saison_dach.json').then(r => r.json())
      ]);
      obstData = obst.obst || [];
      gemueseData = gemuese.gemuese || [];
      kraeuterData = kraeuter.kraeuter || [];
      console.log('[Saison] Daten geladen:', obstData.length, gemueseData.length, kraeuterData.length);
    } catch(e) {
      console.error('[Saison] Fehler beim Laden:', e);
    }
  };

  // ========================================================================
  // HELPER: Check if item is in season
  // ========================================================================
  
  const isInSeason = (item, month) => {
    const monthName = monthNames[month - 1];
    if (!item.saison_dach) return false;
    
    const { freiland, gewaechshaus, lagerware, topfware } = item.saison_dach;
    const all = [...(freiland||[]), ...(gewaechshaus||[]), ...(lagerware||[]), ...(topfware||[])];
    return all.includes(monthName);
  };

  const getSeasonType = (item, month) => {
    const monthName = monthNames[month - 1];
    if (!item.saison_dach) return '';
    
    const { freiland, gewaechshaus, lagerware, topfware } = item.saison_dach;
    if (freiland && freiland.includes(monthName)) return '🌱 Freiland';
    if (gewaechshaus && gewaechshaus.includes(monthName)) return '🏠 Gewächshaus';
    if (topfware && topfware.includes(monthName)) return '🪴 Topfware';
    if (lagerware && lagerware.includes(monthName)) return '📦 Lagerware';
    return '';
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  
  const render = () => {
    const container = document.getElementById('saisonContent');
    if (!container) return;

    let data = [];
    if (currentCategory === 'obst') data = obstData;
    else if (currentCategory === 'gemuese') data = gemueseData;
    else if (currentCategory === 'kraeuter') data = kraeuterData;

    const filtered = data.filter(item => isInSeason(item, currentMonth));
    
    if (filtered.length === 0) {
      container.innerHTML = '<div class="saisonEmpty">Keine Einträge für diesen Monat.</div>';
      return;
    }

    const html = filtered.map(item => {
      const seasonType = getSeasonType(item, currentMonth);
      const bio = item.bio_hinweise?.sinnvoll_bio ? '🌿 Bio empfohlen' : '';
      const lagerung = item.lagerung?.temperatur_celsius || 'k.A.';
      const lagerdauer = item.lagerung?.lagerdauer || 'k.A.';
      
      return `
        <div class="saisonCard">
          <div class="saisonCard__header">
            <div class="saisonCard__title">${escapeHtml(item.deutscher_name)}</div>
            <div class="saisonCard__badges">
              ${seasonType ? `<span class="badge badge--season">${seasonType}</span>` : ''}
              ${bio ? `<span class="badge badge--bio">${bio}</span>` : ''}
            </div>
          </div>
          <div class="saisonCard__meta">
            <div><strong>Familie:</strong> ${escapeHtml(item.pflanzenfamilie || 'k.A.')}</div>
            <div><strong>Lagerung:</strong> ${lagerung}°C · ${lagerdauer}</div>
          </div>
          ${item.bio_hinweise?.gruende ? `
            <div class="saisonCard__bio">
              <strong>Bio-Hinweise:</strong> ${item.bio_hinweise.gruende.join(', ')}
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
    updateMonthButtons();
    render();
  };

  const setCategory = (category) => {
    currentCategory = category;
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
    await loadData();
    
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
  };

  // Export
  window.SaisonKalender = {
    init,
    setMonth,
    setCategory,
    render
  };

  // Auto-init when tab is opened
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab="saison"]');
    if (tab && !window.__SAISON_INITIALIZED__) {
      window.__SAISON_INITIALIZED__ = true;
      init();
    }
  });

})();
