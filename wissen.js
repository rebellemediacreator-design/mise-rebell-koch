/**
 * wissen.js - Wissens-Modul für Lehrjahr-Inhalte
 * Lädt und zeigt strukturierte Lehrjahr-Daten aus JSON-Dateien
 */

(function() {
  'use strict';

  const WissenModule = {
    currentYear: 1,
    data: {},
    searchTerm: '',
    isLoading: true,
    hasError: false,

    async init() {
      console.log('[WissenModule] Initialisierung gestartet...');
      
      // Lade alle 3 Lehrjahre
      try {
        const promises = [
          this.loadJSON('lehrjahr_1.json', 1),
          this.loadJSON('lehrjahr_2.json', 2),
          this.loadJSON('lehrjahr_3.json', 3)
        ];
        
        const results = await Promise.allSettled(promises);
        
        // Prüfe welche Lehrjahre erfolgreich geladen wurden
        results.forEach((result, index) => {
          const year = index + 1;
          if (result.status === 'fulfilled') {
            this.data[year] = result.value;
            console.log(`[WissenModule] Lehrjahr ${year} erfolgreich geladen`);
          } else {
            console.error(`[WissenModule] Fehler beim Laden von Lehrjahr ${year}:`, result.reason);
          }
        });

        // Prüfe ob mindestens ein Lehrjahr geladen wurde
        if (Object.keys(this.data).length === 0) {
          throw new Error('Keine Lehrjahr-Daten konnten geladen werden');
        }

        this.isLoading = false;
        this.hasError = false;
        this.render();
        this.attachEvents();
        
        console.log('[WissenModule] Initialisierung abgeschlossen. Geladene Lehrjahre:', Object.keys(this.data));
      } catch (error) {
        console.error('[WissenModule] Kritischer Fehler:', error);
        this.isLoading = false;
        this.hasError = true;
        this.showError(error.message);
      }
    },

    async loadJSON(filename, year) {
      console.log(`[WissenModule] Lade ${filename}...`);
      const response = await fetch(filename);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${filename} nicht gefunden`);
      }
      
      const data = await response.json();
      return data;
    },

    showError(message) {
      const content = document.getElementById('wissenContent');
      if (!content) return;

      content.innerHTML = `
        <div class="card" style="background: rgba(211, 47, 47, 0.1); border-color: rgba(211, 47, 47, 0.3);">
          <h3 style="color: #d32f2f; margin-top: 0;">⚠️ Fehler beim Laden</h3>
          <p style="margin-bottom: 12px;"><strong>Problem:</strong> ${message}</p>
          
          <div class="divider"></div>
          
          <p><strong>Mögliche Ursachen:</strong></p>
          <ul class="ul">
            <li>Die Lehrjahr-JSON-Dateien fehlen im gleichen Verzeichnis wie index.html</li>
            <li>Die App wird über file:// Protocol geöffnet (lokale Datei statt Webserver)</li>
            <li>Browser blockiert das Laden von lokalen Dateien</li>
          </ul>
          
          <div class="divider"></div>
          
          <p><strong>Lösungen:</strong></p>
          <ul class="ul">
            <li><strong>Option 1:</strong> Stellen Sie sicher, dass <code>lehrjahr_1.json</code>, <code>lehrjahr_2.json</code> und <code>lehrjahr_3.json</code> im gleichen Verzeichnis wie <code>index.html</code> liegen</li>
            <li><strong>Option 2:</strong> Verwenden Sie einen lokalen Webserver (z.B. <code>python3 -m http.server 8000</code> oder Live Server Extension in VS Code)</li>
            <li><strong>Option 3:</strong> Deployen Sie die App auf Netlify/GitHub Pages</li>
          </ul>
          
          <div class="divider"></div>
          
          <button class="btn btn--primary" onclick="window.WissenModule.init()" style="margin-top: 12px;">
            🔄 Erneut versuchen
          </button>
        </div>
      `;
    },

    attachEvents() {
      // Lehrjahr-Wechsel über Year-Buttons
      const yearBtns = document.querySelectorAll('.yearBtn');
      yearBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const year = parseInt(btn.dataset.year);
          if (year !== this.currentYear) {
            this.setYear(year);
            
            // Update year buttons
            yearBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
          }
        });
      });

      // Suche
      const searchInput = document.getElementById('wissenSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchTerm = e.target.value.toLowerCase().trim();
          this.render();
        });
      }

      // Nach oben scrollen
      const btnTop = document.getElementById('btnWissenTop');
      if (btnTop) {
        btnTop.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    },

    setYear(year) {
      console.log(`[WissenModule] Wechsel zu Lehrjahr ${year}`);
      this.currentYear = year;
      this.render();
    },

    render() {
      if (this.isLoading) {
        this.showLoading();
        return;
      }

      if (this.hasError) {
        return; // Fehler wurde bereits in showError() angezeigt
      }

      const yearData = this.data[this.currentYear];
      
      // Fallback: Wenn aktuelles Lehrjahr nicht verfügbar, nehme das erste verfügbare
      if (!yearData) {
        const availableYears = Object.keys(this.data).map(y => parseInt(y));
        if (availableYears.length > 0) {
          this.currentYear = availableYears[0];
          console.log(`[WissenModule] Lehrjahr ${this.currentYear} nicht verfügbar, wechsle zu Lehrjahr ${this.currentYear}`);
          this.render();
          return;
        } else {
          this.showError('Keine Lehrjahr-Daten verfügbar');
          return;
        }
      }

      // Update Pill
      const pill = document.getElementById('wissenYearPill');
      if (pill) {
        pill.textContent = `Lehrjahr ${this.currentYear}`;
      }

      const content = document.getElementById('wissenContent');
      if (!content) return;

      let html = `
        <div class="card wissenContent">
          <h2>${yearData.titel}</h2>
          <div class="kv">
            <div><strong>Dauer:</strong></div>
            <div>${yearData.dauer_monate} Monate</div>
          </div>
          <div class="kv">
            <div><strong>Schulische Stunden:</strong></div>
            <div>${yearData.schulische_stunden} Stunden</div>
          </div>
          <div class="kv">
            <div><strong>Fokus:</strong></div>
            <div>${yearData.fokus}</div>
          </div>
      `;

      // Filter Lernfelder nach Suchbegriff
      let lernfelder = yearData.lernfelder || [];
      if (this.searchTerm) {
        lernfelder = lernfelder.filter(lf => {
          const searchable = [
            lf.titel,
            ...(lf.kernziele || []),
            ...(lf.praktische_fertigkeiten || []),
            ...(lf.theoretische_inhalte || [])
          ].join(' ').toLowerCase();
          return searchable.includes(this.searchTerm);
        });

        if (lernfelder.length === 0) {
          html += `
            <div class="divider"></div>
            <p style="color: #d32f2f; font-weight: 700;">
              Keine Ergebnisse für "${this.searchTerm}" gefunden.
            </p>
          `;
        }
      }

      // Lernfelder rendern
      if (lernfelder.length > 0) {
        html += `<div class="divider"></div><h3>Lernfelder (${lernfelder.length})</h3>`;

        lernfelder.forEach(lf => {
          html += `
            <div class="entry">
              <div class="entry__title">LF ${lf.lf_nummer}: ${lf.titel}</div>
              <div class="entry__meta">${lf.stunden} Stunden</div>
              <div class="entry__body">
          `;

          // Kernziele
          if (lf.kernziele && lf.kernziele.length > 0) {
            html += `
              <p style="margin-top: 12px;"><strong>Kernziele:</strong></p>
              <ul class="ul">
                ${lf.kernziele.map(k => `<li>${k}</li>`).join('')}
              </ul>
            `;
          }

          // Praktische Fertigkeiten
          if (lf.praktische_fertigkeiten && lf.praktische_fertigkeiten.length > 0) {
            html += `
              <p style="margin-top: 12px;"><strong>Praktische Fertigkeiten:</strong></p>
              <ul class="ul">
                ${lf.praktische_fertigkeiten.map(p => `<li>${p}</li>`).join('')}
              </ul>
            `;
          }

          // Theoretische Inhalte (nur Lehrjahr 2+3)
          if (lf.theoretische_inhalte && lf.theoretische_inhalte.length > 0) {
            html += `
              <p style="margin-top: 12px;"><strong>Theoretische Inhalte:</strong></p>
              <ul class="ul">
                ${lf.theoretische_inhalte.map(t => `<li>${t}</li>`).join('')}
              </ul>
            `;
          }

          html += `
              </div>
            </div>
          `;
        });
      }

      html += `</div>`;
      content.innerHTML = html;
    },

    showLoading() {
      const content = document.getElementById('wissenContent');
      if (!content) return;

      content.innerHTML = `
        <div class="card">
          <p style="text-align: center; padding: 40px 20px;">
            <strong>Lade Wissens-Inhalte...</strong>
          </p>
        </div>
      `;
    }
  };

  // Auto-Init wenn DOM bereit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WissenModule.init());
  } else {
    WissenModule.init();
  }

  // Global verfügbar machen
  window.WissenModule = WissenModule;

  // Expose setYear für externe Aufrufe
  window.WissenModule.setYear = (year) => WissenModule.setYear(year);
})();
