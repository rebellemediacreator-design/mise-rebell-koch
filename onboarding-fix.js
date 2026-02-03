// ============================================================================
// ONBOARDING FIX - Speichert Name, Betrieb, Ausbilder, Start etc.
// ============================================================================

(() => {
  const $ = (s) => document.querySelector(s);
  
  // Onboarding Modal
  const modal = $('#onboarding');
  const btnSave = $('#obSave');
  
  // Felder
  const fields = {
    name: $('#obName'),
    job: $('#obJob'),
    company: $('#obCompany'),
    trainer: $('#obTrainer'),
    start: $('#obStart'),
    mode: $('#obMode')
  };
  
  // LocalStorage Key für Onboarding-Daten
  const ONBOARDING_KEY = 'azubi_onboarding_data';
  
  // Lade gespeicherte Daten
  const loadOnboardingData = () => {
    try {
      const raw = localStorage.getItem(ONBOARDING_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Fehler beim Laden der Onboarding-Daten:', e);
      return null;
    }
  };
  
  // Speichere Onboarding-Daten
  const saveOnboardingData = () => {
    try {
      const data = {
        name: fields.name?.value || '',
        job: fields.job?.value || 'Koch/Köchin',
        company: fields.company?.value || '',
        trainer: fields.trainer?.value || '',
        start: fields.start?.value || '',
        mode: fields.mode?.value || 'weekly',
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
      
      // Zeige Bestätigung
      showToast('Setup erfolgreich gespeichert! ✓');
      
      // Schließe Modal
      if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      }
      
      // Update Header mit gespeicherten Daten
      updateHeader(data);
      
      return true;
    } catch (e) {
      console.error('Fehler beim Speichern der Onboarding-Daten:', e);
      showToast('Fehler beim Speichern! ✗');
      return false;
    }
  };
  
  // Toast-Nachricht anzeigen
  const showToast = (message) => {
    // Prüfe ob Toast-Funktion existiert
    if (typeof window.toast === 'function') {
      window.toast(message);
      return;
    }
    
    // Fallback: einfaches Alert
    const toastEl = document.createElement('div');
    toastEl.textContent = message;
    toastEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ecc71;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-weight: 500;
    `;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  };
  
  // Update Header mit Daten
  const updateHeader = (data) => {
    // Suche nach Header-Elementen für Name und Betrieb
    const nameDisplay = document.querySelector('.user-name, .azubi-name, [data-field="name"]');
    const companyDisplay = document.querySelector('.company-name, .betrieb-name, [data-field="company"]');
    
    if (nameDisplay && data.name) {
      nameDisplay.textContent = data.name;
    }
    if (companyDisplay && data.company) {
      companyDisplay.textContent = data.company;
    }
  };
  
  // Hydrate Felder mit gespeicherten Daten
  const hydrateFields = () => {
    const data = loadOnboardingData();
    if (!data) return;
    
    if (fields.name) fields.name.value = data.name || '';
    if (fields.job) fields.job.value = data.job || 'Koch/Köchin';
    if (fields.company) fields.company.value = data.company || '';
    if (fields.trainer) fields.trainer.value = data.trainer || '';
    if (fields.start) fields.start.value = data.start || '';
    if (fields.mode) fields.mode.value = data.mode || 'weekly';
    
    // Update Header
    updateHeader(data);
  };
  
  // Prüfe ob Onboarding-Modal beim Start gezeigt werden soll
  const checkOnboardingRequired = () => {
    const data = loadOnboardingData();
    
    // Wenn keine Daten vorhanden oder Name/Start fehlt, zeige Modal
    if (!data || !data.name || !data.start) {
      if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
      }
    } else {
      // Daten vorhanden, Modal verstecken
      if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      }
      // Update Header mit vorhandenen Daten
      updateHeader(data);
    }
  };
  
  // Event Listener für Save Button
  if (btnSave) {
    btnSave.addEventListener('click', (e) => {
      e.preventDefault();
      saveOnboardingData();
    });
  }
  
  // Event Listener für Modal Backdrop (Schließen)
  if (modal) {
    const backdrop = modal.querySelector('.modal__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        // Nur schließen wenn Daten vorhanden
        const data = loadOnboardingData();
        if (data && data.name && data.start) {
          modal.setAttribute('aria-hidden', 'true');
          modal.style.display = 'none';
        } else {
          showToast('Bitte Setup ausfüllen und speichern!');
        }
      });
    }
  }
  
  // Enter-Taste in Feldern = Speichern
  Object.values(fields).forEach(field => {
    if (field) {
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveOnboardingData();
        }
      });
    }
  });
  
  // Init beim Laden
  const init = () => {
    hydrateFields();
    checkOnboardingRequired();
  };
  
  // Falls DOMContentLoaded schon gefeuert wurde
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM ist bereits geladen, sofort initialisieren
    setTimeout(init, 100);
  }
  
  // Exportiere Funktionen für externe Nutzung
  window.azubiOnboarding = {
    load: loadOnboardingData,
    save: saveOnboardingData,
    show: () => {
      if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
      }
    },
    hide: () => {
      if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
      }
    }
  };
  
})();
