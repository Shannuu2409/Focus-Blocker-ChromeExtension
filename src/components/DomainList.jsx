import React from "react";
// removed framer-motion to fix linter error
import { Button } from "@/components/ui/button";
import { X, Globe } from "lucide-react";

/**
 * A component for displaying the list of blocked domains.
 * @param {object} props
 * @param {string[]} props.domains - The array of domains to display.
 * @param {function(string): Promise<void>} props.onRemoveDomain - The callback function to remove a domain.
 */
export default function DomainList({ domains, onRemoveDomain }) {
    if (domains.length === 0) {
        return (
            <div className="text-center py-8">
                <Globe className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400 text-sm">No domains added yet</p>
                <p className="text-gray-500 text-xs mt-1">Add a domain above to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {domains.map((domain) => (
                <div
                    key={domain}
                    className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg p-3 group hover:bg-gray-900/80 transition-all duration-200"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-white text-sm font-medium truncate">
                            {domain}
                        </span>
                    </div>
                    <Button
                        onClick={() => onRemoveDomain(domain)}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-6 w-6"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
