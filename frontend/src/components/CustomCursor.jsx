import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Raw mouse coordinates
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Ring (Moves slightly slower, creates a trailing effect)
    const ringX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
    const ringY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

    // Dot (Moves very fast, almost instantly glued to the actual pointer)
    const dotX = useSpring(mouseX, { damping: 40, stiffness: 800, mass: 0.1 });
    const dotY = useSpring(mouseY, { damping: 40, stiffness: 800, mass: 0.1 });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        if (isMobile) {
            document.body.style.cursor = 'auto';
            return () => window.removeEventListener('resize', checkMobile);
        }

        // Hide native cursor globally
        document.body.style.cursor = 'none';

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, input, select, textarea, [role="button"], label, .cursor-pointer');
            setIsHovered(!!isClickable);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            document.body.style.cursor = 'auto'; // Restore on unmount
        };
    }, [isMobile]);

    if (isMobile) return null;

    return (
        <>
            {/* Trailing Hollow Ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{ x: ringX, y: ringY }}
            >
                <motion.div
                    className="transform -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-sm backdrop-blur-[1px]"
                    animate={{
                        width: isHovered ? 56 : 36,
                        height: isHovered ? 56 : 36,
                        backgroundColor: isHovered ? "rgba(59, 130, 246, 0.15)" : "transparent",
                        borderColor: isHovered ? "rgba(59, 130, 246, 0.4)" : "rgba(255, 255, 255, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
            </motion.div>

            {/* Fast Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{ x: dotX, y: dotY }}
            >
                <motion.div
                    className="transform -translate-x-1/2 -translate-y-1/2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    animate={{
                        width: isHovered ? 0 : 8,
                        height: isHovered ? 0 : 8,
                        opacity: isHovered ? 0 : 1
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
            </motion.div>
        </>
    );
};

export default CustomCursor;
