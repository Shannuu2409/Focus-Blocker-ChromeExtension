import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

/**
 * A component for setting the duration of the blocking session.
 * @param {object} props
 * @param {number} props.duration - The current duration value.
 * @param {function(number): void} props.onDurationChange - The callback to update the duration.
 */
export default function TimeInput({ duration, onDurationChange }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
        >
            <Label className="text-white text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Block Duration
            </Label>
            <div className="relative">
                <Input
                    type="number"
                    min="1"
                    max="1440"
                    step="1"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => onDurationChange(parseInt(e.target.value, 10) || 0)}
                    className="bg-[#1A1A1A] border-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    minutes
                </span>
            </div>
            <p className="text-xs text-gray-500">
                Enter how many minutes you want to block these domains
            </p>
        </motion.div>
    );
}
