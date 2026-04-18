import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Option 1: Use sessionStorage to only show once per tab usage
        const hasSeenPreloader = sessionStorage.getItem('epc_preloader_seen');
        if (hasSeenPreloader) {
            setIsLoading(false);
            return;
        }

        // Lock scroll while preloading
        document.body.style.overflow = 'hidden';

        const duration = 6000; // 6 seconds
        const intervalTime = 50;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            // Use custom easing math for a sleek speed-up then slow-down effect
            const easedProgress = Math.min(
                100,
                Math.round((1 - Math.pow(1 - currentStep / steps, 3)) * 100)
            );
            setProgress(easedProgress);

            if (currentStep >= steps) {
                clearInterval(interval);
                setTimeout(() => {
                    sessionStorage.setItem('epc_preloader_seen', 'true');
                    setIsLoading(false);
                    document.body.style.overflow = 'auto'; // Restore scroll
                }, 500); // Small pause at 100%
            }
        }, intervalTime);

        return () => {
            clearInterval(interval);
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "-100vh", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
                    className="fixed inset-0 z-[99999] bg-[#020617] text-white flex flex-col justify-between items-center px-8 py-16 sm:px-16 sm:py-20"
                >
                    {/* Top Branding */}
                    <div className="w-full flex justify-between items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="font-bold tracking-widest uppercase text-xs sm:text-sm text-slate-500"
                        >
                            System Initialization
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="font-bold tracking-widest uppercase text-xs sm:text-sm text-slate-500"
                        >
                            NEW EDITION
                        </motion.div>
                    </div>

                    {/* Center Large Typography */}
                    <div className="flex flex-col items-center justify-center relative w-full flex-1">
                        <div className="overflow-hidden">
                            <motion.h1
                                initial={{ y: 150 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                                className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter"
                            >
                                e-PC<span className="text-blue-500"></span>
                            </motion.h1>
                        </div>
                        <div className="overflow-hidden mt-4">
                            <motion.p
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                className="text-lg sm:text-2xl text-slate-400 font-light tracking-widest uppercase text-center"
                            >
                                Intelligent Digital Panchayat
                            </motion.p>
                        </div>
                    </div>

                    {/* Bottom Progress Bar & Percentage */}
                    <div className="w-full flex flex-col items-center justify-end gap-6 relative">
                        <div className="w-full flex justify-between items-end border-b border-white/20 pb-4">
                            <span className="text-sm font-medium text-slate-400">Loading Assets...</span>
                            <div className="text-5xl sm:text-7xl font-bold font-mono tracking-tighter flex items-end">
                                {progress}<span className="text-2xl sm:text-4xl text-blue-500 pb-1">%</span>
                            </div>
                        </div>

                        {/* Smooth Filling Bar */}
                        <div className="h-1 sm:h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
