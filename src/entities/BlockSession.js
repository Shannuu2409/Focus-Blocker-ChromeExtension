// BlockSession entity for managing active blocking sessions
/* global chrome */

export class BlockSession {
    static async filter(query, limit = null) {
        // Ensure we're in a browser extension context
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.warn('Chrome storage API not available');
            return [];
        }
        
        const sessions = await chrome.storage.sync.get('blockSessions');
        let filteredSessions = (sessions.blockSessions || [])
            .filter(s => Object.entries(query)
                .every(([key, value]) => s[key] === value));
        
        if (limit) {
            filteredSessions = filteredSessions.slice(0, limit);
        }
        
        return filteredSessions;
    }

    static async create(sessionData) {
        const sessions = await chrome.storage.sync.get('blockSessions');
        const currentSessions = sessions.blockSessions || [];
        
        const newSession = {
            id: Date.now().toString(),
            ...sessionData,
            created_date: new Date().toISOString()
        };
        
        currentSessions.push(newSession);
        await chrome.storage.sync.set({ blockSessions: currentSessions });
        
        // Update blocking rules in the extension
        if (chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'updateRules',
                sites: sessionData.domains
            });
        }
        
        return newSession;
    }

    static async update(id, updates) {
        const sessions = await chrome.storage.sync.get('blockSessions');
        const currentSessions = sessions.blockSessions || [];
        
        const updatedSessions = currentSessions.map(session => 
            session.id === id ? { ...session, ...updates } : session
        );
        
        await chrome.storage.sync.set({ blockSessions: updatedSessions });
        
        // If session is no longer active, clear blocking rules
        if (updates.is_active === false && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'updateRules',
                sites: []
            });
        }
    }
}
