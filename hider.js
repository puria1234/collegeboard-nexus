/**
 * CollegeBoard Nexus — Answer Hider
 *
 * Based on the AP Classroom Answer Hider app.
 * Injects CSS to hide correct/incorrect indicators and provides a
 * floating toggle panel in the top frame.
 */
(() => {
  'use strict';

  const MESSAGE_SOURCE = 'cb-nexus-hider';

  // ── CSS that hides answer indicators ─────────────────────────────────────
  const HIDE_CSS = `
.mcq-option.--correct,
.mcq-option.--incorrect {
  background-color: rgba(255,255,255,1) !important;
  border: 0 !important;
}
.response-analysis-wrapper > .icon {
  display: none !important;
}
.--chosen {
  color: inherit !important;
  background-color: inherit !important;
}
.LearnosityDistractor {
  display: none !important;
}
`;

  // ── CSS for the floating panel UI ────────────────────────────────────────
  const PANEL_CSS = `
.cbh-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  color: #f5f5f5;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12.5px;
  user-select: none;
  transition: all .25s ease;
}
.cbh-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.06), transparent 40%);
  pointer-events: none;
}
.cbh-panel--collapsed { padding: 8px 12px; gap: 0; }
.cbh-panel--collapsed .cbh-title,
.cbh-panel--collapsed .cbh-switch,
.cbh-panel--collapsed .cbh-status { display: none; }
.cbh-title { font-weight: 600; white-space: nowrap; letter-spacing: 0.2px; }
.cbh-switch {
  position: relative; display: inline-block;
  width: 42px; height: 22px; flex-shrink: 0; cursor: pointer;
}
.cbh-switch input { opacity: 0; width: 0; height: 0; }
.cbh-slider {
  position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: background .2s, border .2s, box-shadow .2s;
}
.cbh-slider::after {
  content: ""; position: absolute; left: 3px; top: 3px;
  width: 16px; height: 16px; background: #0a0a0a;
  border-radius: 50%; transition: transform .2s, background .2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.cbh-switch input:checked + .cbh-slider {
  background: linear-gradient(135deg, #ffffff 0%, #d5d5d5 100%);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.25);
}
.cbh-switch input:checked + .cbh-slider::after {
  transform: translateX(18px);
  background: #0b0b0b;
}
.cbh-status {
  padding: 2px 8px; border-radius: 6px; font-size: 11px;
  font-weight: 600; background: linear-gradient(135deg, #ffffff 0%, #d5d5d5 100%);
  color: #0a0a0a; white-space: nowrap; transition: all .2s;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.cbh-status--showing {
  background: rgba(255, 255, 255, 0.12);
  color: #e5e5e5;
  border-color: rgba(255, 255, 255, 0.2);
}
.cbh-collapse-btn {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border: none; border-radius: 6px;
  background: rgba(255,255,255,.08); color: #cbd5f5;
  font-size: 16px; line-height: 1; cursor: pointer;
  transition: background .15s, color .15s; flex-shrink: 0;
}
.cbh-collapse-btn:hover { background: rgba(255,255,255,.16); color: #ffffff; }
`;

  // ── State ────────────────────────────────────────────────────────────────
  let hideStyleEl = null;
  let panelStyleEl = null;
  let hiding = true;
  let panelBuilt = false;
  let panelRefs = null;

  const isTopFrame = () => window.top === window.self;

  function setHiding(on, options = {}) {
    const { broadcast = true } = options;
    hiding = !!on;
    if (hideStyleEl) hideStyleEl.media = hiding ? 'all' : 'not all';
    updatePanelState();
    if (broadcast) {
      broadcastStateToChildFrames();
    }
  }

  function injectHideStyles() {
    if (hideStyleEl) return;
    const head = document.head || document.documentElement;
    hideStyleEl = document.createElement('style');
    hideStyleEl.textContent = HIDE_CSS;
    head.appendChild(hideStyleEl);
    setHiding(hiding, { broadcast: false });
  }

  function injectPanelStyles() {
    if (panelStyleEl) return;
    const head = document.head || document.documentElement;
    panelStyleEl = document.createElement('style');
    panelStyleEl.textContent = PANEL_CSS;
    head.appendChild(panelStyleEl);
  }

  function postMessageSafe(target, data) {
    try {
      if (target && typeof target.postMessage === 'function') {
        target.postMessage(data, '*');
      }
    } catch (e) {
      // ignore
    }
  }

  function broadcastStateToChildFrames() {
    const payload = { source: MESSAGE_SOURCE, type: 'cbh-toggle', hiding };
    document.querySelectorAll('iframe').forEach((frame) => {
      postMessageSafe(frame.contentWindow, payload);
    });
  }

  function buildPanel() {
    if (panelBuilt || !isTopFrame()) return;
    panelBuilt = true;

    injectPanelStyles();

    const panel = document.createElement('div');
    panel.className = 'cbh-panel';

    const title = document.createElement('span');
    title.className = 'cbh-title';
    title.textContent = 'Nexus Hider';
    panel.appendChild(title);

    const toggleWrap = document.createElement('label');
    toggleWrap.className = 'cbh-switch';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    const slider = document.createElement('span');
    slider.className = 'cbh-slider';
    toggleWrap.appendChild(checkbox);
    toggleWrap.appendChild(slider);
    panel.appendChild(toggleWrap);

    const status = document.createElement('span');
    status.className = 'cbh-status';

    panelRefs = { checkbox, status };
    updatePanelState();

    checkbox.addEventListener('change', () => {
      setHiding(checkbox.checked);
    });
    panel.appendChild(status);

    let collapsed = false;
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'cbh-collapse-btn';
    collapseBtn.textContent = '\u2212';
    collapseBtn.title = 'Minimize';
    collapseBtn.addEventListener('click', () => {
      collapsed = !collapsed;
      panel.classList.toggle('cbh-panel--collapsed', collapsed);
      collapseBtn.textContent = collapsed ? '+' : '\u2212';
      collapseBtn.title = collapsed ? 'Expand' : 'Minimize';
    });
    panel.appendChild(collapseBtn);

    document.body.appendChild(panel);

    // Sync current state to child frames now and when new iframes appear.
    broadcastStateToChildFrames();
    const observer = new MutationObserver((mutations) => {
      let sawIframe = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!node || node.nodeType !== 1) continue;
          if (node.tagName === 'IFRAME') {
            sawIframe = true;
            break;
          }
          if (node.querySelector && node.querySelector('iframe')) {
            sawIframe = true;
            break;
          }
        }
        if (sawIframe) break;
      }
      if (sawIframe) broadcastStateToChildFrames();
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
  }

  function updatePanelState() {
    if (!panelRefs) return;
    panelRefs.checkbox.checked = hiding;
    panelRefs.status.textContent = hiding ? 'Hidden' : 'Showing';
    panelRefs.status.classList.toggle('cbh-status--showing', !hiding);
  }

  function handleMessage(event) {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.source !== MESSAGE_SOURCE) return;

    if (data.type === 'cbh-toggle' || data.type === 'cbh-state') {
      setHiding(!!data.hiding, { broadcast: true });
      return;
    }

    if (data.type === 'cbh-request') {
      postMessageSafe(event.source, {
        source: MESSAGE_SOURCE,
        type: 'cbh-state',
        hiding,
      });
    }
  }

  function requestStateFromParent() {
    if (isTopFrame()) return;
    postMessageSafe(window.parent, {
      source: MESSAGE_SOURCE,
      type: 'cbh-request',
    });
  }

  // ── Bootstrap — nothing runs until body exists ────────────────────────────
  function boot() {
    try {
      if (!document.body) {
        // Retry once in rare cases.
        setTimeout(boot, 200);
        return;
      }
      injectHideStyles();
      buildPanel();
      requestStateFromParent();
    } catch (e) {
      console.error('Answer Hider:', e);
    }
  }

  window.addEventListener('message', handleMessage, false);

  window.__cbhGetHiding = () => hiding;
  window.__cbhSetHiding = (value) => {
    setHiding(!!value);
    return hiding;
  };

  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || message.namespace !== MESSAGE_SOURCE) return;
      if (message.action === 'get') {
        sendResponse({ hiding });
        return true;
      }
      if (message.action === 'set') {
        setHiding(!!message.hiding);
        sendResponse({ hiding });
        return true;
      }
      if (message.action === 'toggle') {
        setHiding(!hiding);
        sendResponse({ hiding });
        return true;
      }
      return true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
