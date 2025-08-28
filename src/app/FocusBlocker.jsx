import React, { useState, useEffect } from "react";
import { BlockedDomain, BlockSession } from "@/entities/all";


import DomainInput from "../components/DomainInput";
import DomainList from "../components/DomainList";
import TimeInput from "../components/TimeInput";
import ActionButton from "../components/ActionButton";

export default function FocusBlocker() {
    // State management for domains, duration, loading status, and active session
    const [domains, setDomains] = useState([]);
    const [duration, setDuration] = useState(30); // minutes
    const [isLoading, setIsLoading] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    // Load initial data on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Function to load data from the persistence layer
    const loadData = async () => {
        // Load existing domains from the 'BlockedDomain' entity
        const existingDomains = await BlockedDomain.list('-added_at');
        setDomains(existingDomains.map(d => d.domain));

        // Check for any currently active blocking sessions
        const sessions = await BlockSession.filter({ is_active: true });
        // pick the newest active session
        const sorted = sessions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        if (sorted.length > 0) {
            const session = sorted[0];
            const endTime = new Date(session.end_time);
            // If the session has not expired yet, set it as active
            if (endTime > new Date()) {
                setActiveSession(session);
            } else {
                // If it has expired, update its status
                await BlockSession.update(session.id, { is_active: false });
            }
        }
    };

    // Function to add a new domain
    const addDomain = async (domain) => {
        const normalized = domain.replace(/^www\./, '');
        if (!domains.includes(normalized)) {
            // Persist the new domain
            await BlockedDomain.create({ domain: normalized });
            // Update local state
            setDomains([...domains, normalized]);
        }
    };

    // Function to remove a domain
    const removeDomain = async (domainToRemove) => {
        const domainEntity = await BlockedDomain.filter({ domain: domainToRemove });
        if (domainEntity.length > 0) {
            // Remove the domain from persistence
            await BlockedDomain.delete(domainEntity[0].id);
        }
        // Update local state
        setDomains(domains.filter(d => d !== domainToRemove));
    };

    // Function to start a new blocking session
    const startBlocking = async () => {
        if (domains.length === 0 || duration <= 0) return;

        setIsLoading(true);
        try {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

            // Create a new session in the persistence layer
            const session = await BlockSession.create({
                domains: domains,
                duration_hours: duration,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                is_active: true
            });

            // Set the new session as active
            setActiveSession(session);
        } catch (error) {
            console.error("Error starting focus session:", error);
        }
        setIsLoading(false);
    };

    // Render the active session view
    if (activeSession) {
        const endTime = new Date(activeSession.end_time);
        const timeLeft = Math.max(0, endTime - new Date());
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return (
            <div className="w-[420px] h-full bg-[#111] text-white px-5 py-6">
                <div className="w-full mx-auto overflow-y-auto" style={{ height: '552px' }}>
                    <div
                        className="bg-gradient-to-b from-[#1C1C1C] to-[#111111] border border-gray-800 rounded-2xl p-8 text-center"
                    >
                        <h2 className="text-2xl font-bold mb-4">Focus Mode Active</h2>
                        <p className="text-gray-400 mb-6">
                            {activeSession.domains.length} domain{activeSession.domains.length !== 1 ? 's' : ''} blocked
                        </p>
                        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
                            <p className="text-3xl font-bold text-green-400">
                                {hoursLeft}h {minutesLeft}m
                            </p>
                            <p className="text-gray-500 text-sm">Time remaining</p>
                        </div>
                        <div className="space-y-2">
                            {activeSession.domains.map(domain => (
                                <div key={domain} className="flex items-center gap-2 text-sm text-gray-400">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {domain}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render the setup view
    return (
        <div className="w-[420px] h-full bg-[#111] text-white px-5 py-6">
            <div className="w-full mx-auto overflow-y-auto" style={{ height: '552px' }}>
                <div
                    className="text-center mb-8 mt-4"
                >
                    <h1 className="text-2xl font-bold mb-2 text-white">Focus Blocker</h1>
                    <p className="text-gray-400 text-sm">Block distracting websites and stay focused</p>
                </div>

                <div className="bg-gradient-to-b from-[#1C1C1C] to-[#111111] border border-gray-800 rounded-2xl p-6 space-y-6">
                    <div>
                        <h3 className="text-white text-sm font-medium mb-3">Block Domains</h3>
                        <DomainInput onAddDomain={addDomain} />
                    </div>

                    {domains.length > 0 && (
                        <div>
                            <h3 className="text-white text-sm font-medium mb-3">
                                Blocked Sites ({domains.length})
                            </h3>
                            <DomainList domains={domains} onRemoveDomain={removeDomain} />
                        </div>
                    )}

                    <div className="border-t border-gray-800 pt-6">
                        <TimeInput duration={duration} onDurationChange={setDuration} />
                    </div>

                    <ActionButton
                        onClick={startBlocking}
                        disabled={domains.length === 0 || duration <= 0}
                        isLoading={isLoading}
                        domains={domains}
                        duration={duration}
                    />
                </div>
            </div>

            {/* scrollbar styles moved to global CSS */}
        </div>
    );
}
