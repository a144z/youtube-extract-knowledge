// YouTube Caption Bubble Extension - Modular Version

// Initialize settings first
SettingsModule.init();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', CoreModule.init);
} else {
  CoreModule.init();
}

window.addEventListener('beforeunload', CoreModule.cleanup);
