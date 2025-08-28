import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * The main action button to start the blocking session.
 * @param {object} props
 * @param {function(): Promise<void>} props.onClick - The click handler to start the session.
 * @param {boolean} props.disabled - Whether the button should be disabled.
 * @param {boolean} props.isLoading - Whether the button is in a loading state.
 * @param {string[]} props.domains - The array of domains to be blocked.
 * @param {number} props.duration - The duration of the session.
 */
export default function ActionButton({ 
    onClick, 
    disabled, 
    isLoading, 
    domains, 
    duration 
}) {
    // Check if the button is ready to be activated
    const isReady = domains.length > 0 && duration > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Button
                onClick={onClick}
                disabled={disabled || !isReady}
                className={`w-full h-12 text-white font-semibold transition-all duration-300 ${
                    isReady 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 shadow-lg hover:shadow-blue-500/20' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Starting Focus Mode...
                    </>
                ) : (
                    <>
                        <Shield className="w-5 h-5 mr-2" />
                        Start Focus Mode
                    </>
                )}
            </Button>
            
            {isReady && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-400 text-center mt-2"
                >
                    Block {domains.length} domain{domains.length !== 1 ? 's' : ''} for {duration} minute{duration !== 1 ? 's' : ''}
                </motion.p>
            )}
        </motion.div>
    );
}
