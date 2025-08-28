// BlockedDomain entity for managing blocked domain persistence
export class BlockedDomain {
    static async list(sortBy = '-added_at') {
        const domains = await chrome.storage.sync.get('blockedDomains');
        return domains.blockedDomains || [];
    }

    static async create({ domain }) {
        const domains = await this.list();
        const newDomain = {
            id: Date.now().toString(),
            domain,
            added_at: new Date().toISOString()
        };
        domains.push(newDomain);
        await chrome.storage.sync.set({ blockedDomains: domains });
        return newDomain;
    }

    static async filter(query) {
        const domains = await this.list();
        return domains.filter(d => d.domain.replace(/^www\./,'') === (query.domain || '').replace(/^www\./,''));
    }

    static async delete(id) {
        const domains = await this.list();
        const updatedDomains = domains.filter(d => d.id !== id);
        await chrome.storage.sync.set({ blockedDomains: updatedDomains });
    }
}
