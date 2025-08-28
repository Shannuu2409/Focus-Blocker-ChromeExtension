import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

/**
 * A component for entering and adding new domains to the blocked list.
 * @param {object} props
 * @param {function(string): Promise<void>} props.onAddDomain - The callback function to add a new domain.
 */
export default function DomainInput({ onAddDomain }) {
    const [domain, setDomain] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (domain.trim()) {
            // Clean the domain input
            let cleanDomain = domain.trim().toLowerCase();
            // Remove protocol if present
            cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
            // Remove www. if present
            cleanDomain = cleanDomain.replace(/^www\./, '');
            // Remove trailing slash
            cleanDomain = cleanDomain.replace(/\/$/, '');
            
            onAddDomain(cleanDomain);
            setDomain("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                    type="text"
                    placeholder="Enter domain (e.g. youtube.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="flex-1 bg-[#1A1A1A] border-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Button
                    type="submit"
                    disabled={!domain.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </form>
        </motion.div>
    );
}
