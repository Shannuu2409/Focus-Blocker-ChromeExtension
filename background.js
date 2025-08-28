// A persistent Service Worker for the extension's background logic.

// A base ID for our blocking rules. We will add an index to this for each site.
// A unique ID is required for each rule.
const RULE_BASE_ID = 1001;
let lastAppliedDomains = [];

/**
 * Creates a declarativeNetRequest rule object for a given website domain.
 * The rule is configured to redirect the user to the blocked page.
 * @param {string} site The domain to block (e.g., "youtube.com").
 * @param {number} index The index of the site in the list, used for a unique rule ID.
 * @returns {object} A declarativeNetRequest rule object.
 */
function createBlockingRule(site, index) {
  return {
    id: RULE_BASE_ID + index, // Ensure each rule has a unique ID
    priority: 1, // High priority to ensure it's processed first
    action: {
      // Use hard block to ensure the navigation is stopped reliably
      type: 'block',
    },
    condition: {
      // The `urlFilter` specifies the URL pattern to block.
      // `||` is a syntax that matches the start of a hostname.
      urlFilter: `||${site}^`,
      resourceTypes: ['main_frame'], // Only block the main page load, not assets like images or CSS
    },
  };
}

/**
 * Updates the set of dynamic blocking rules for the extension.
 * It first removes all existing rules and then adds the new ones.
 * @param {string[]} sites An array of website domains to block.
 */
async function updateBlockingRules(sites) {
  try {
    // Get all current dynamic rules to remove them first.
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);

    // Remove all rules managed by this extension.
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
    });
    console.log('Removed all existing blocking rules.');

    // Create and add the new rules based on the updated sites list.
    const newRules = sites.map((site, index) => createBlockingRule(site, index));
    if (newRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: newRules,
      });
      const applied = await chrome.declarativeNetRequest.getDynamicRules();
      console.log('Added new blocking rules successfully. Count:', applied.length);
      lastAppliedDomains = sites.map((s) => s.replace(/^www\./, ''));
    } else {
      console.log('No sites to block. No new rules added.');
      lastAppliedDomains = [];
    }
  } catch (error) {
    console.error('Failed to update blocking rules:', error);
  }
}

/**
 * Reads active sessions from storage and determines which domains should be blocked.
 * Returns an array of domains or an empty array if no active session remains.
 */
async function getActiveDomainsFromSessions() {
  try {
    const { blockSessions } = await chrome.storage.sync.get('blockSessions');
    const sessions = Array.isArray(blockSessions) ? blockSessions : [];
    const now = Date.now();
    // Choose the latest active session that has not expired
    const active = sessions
      .filter(s => s.is_active && new Date(s.end_time).getTime() > now)
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    if (active.length > 0) {
      return Array.isArray(active[0].domains) ? active[0].domains : [];
    }
  } catch (e) {
    console.error('Error reading active sessions:', e);
  }
  return [];
}

/**
 * Schedule an alarm to clear rules when the current active session ends.
 */
async function scheduleExpiryAlarm() {
  try {
    const { blockSessions } = await chrome.storage.sync.get('blockSessions');
    const sessions = Array.isArray(blockSessions) ? blockSessions : [];
    const now = Date.now();
    const active = sessions
      .filter(s => s.is_active && new Date(s.end_time).getTime() > now)
      .sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime());
    if (active.length > 0) {
      const when = new Date(active[0].end_time).getTime();
      await chrome.alarms.clear('focus-expiry');
      chrome.alarms.create('focus-expiry', { when });
    } else {
      await chrome.alarms.clear('focus-expiry');
    }
  } catch (e) {
    console.error('Failed to schedule expiry alarm:', e);
  }
}

/**
 * Redirect any open tabs that are on one of the provided domains to a neutral homepage.
 */
async function redirectTabsToHome(domains) {
  if (!Array.isArray(domains) || domains.length === 0) return;
  const normalized = domains.map((d) => d.replace(/^www\./, ''));
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url) continue;
      try {
        const u = new URL(tab.url);
        const host = (u.hostname || '').replace(/^www\./, '');
        const matches = normalized.some((d) => host === d || host.endsWith('.' + d));
        if (matches) {
          chrome.tabs.update(tab.id, { url: 'https://www.google.com/' });
        }
      } catch (e) {
        // ignore invalid URLs
      }
    }
  } catch (e) {
    console.error('Failed to redirect tabs after session end:', e);
  }
}

// Listen for a message from the popup (your App.jsx component).
// This is the main communication channel from the UI to the background script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateRules') {
    if (request.sites) {
      console.log('Received new sites list from popup:', request.sites);
      updateBlockingRules(request.sites);
      scheduleExpiryAlarm();
      sendResponse({ status: 'Rules updated' });
    }
  }
  // Make sure to return true to indicate that the response will be sent asynchronously.
  return true;
});

// A listener for when the extension is first installed or updated.
// This ensures that the blocking rules are set up correctly on startup.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Focus Blocker Extension Installed.");
  // Load active session domains and set up the rules.
  getActiveDomainsFromSessions().then(updateBlockingRules);
  scheduleExpiryAlarm();
});

// Ensure rules are applied when the service worker starts
getActiveDomainsFromSessions().then(updateBlockingRules);
scheduleExpiryAlarm();

// React to storage changes to keep rules in sync with sessions
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.blockSessions) {
    getActiveDomainsFromSessions().then(updateBlockingRules);
    scheduleExpiryAlarm();
  }
});

// Clear rules when the expiry alarm fires and no active session remains
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focus-expiry') {
    const domains = await getActiveDomainsFromSessions();
    if (domains.length === 0) {
      updateBlockingRules([]);
      // move tabs away from blocked sites to a safe homepage
      await redirectTabsToHome(lastAppliedDomains);
    } else {
      scheduleExpiryAlarm();
    }
  }
});

