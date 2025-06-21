import { motion, Variants } from "framer-motion";

function PawLoadingAnimation() {
    const pawVariants: Variants = {
        jump: {
            y: -25,
            transition: {
                duration: 0.6,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    };

    const PawIcon = () => (
        <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="paw-icon"
        >
            {/* 猫爪图案 - 主垫 */}
            <ellipse cx="12" cy="17" rx="4.5" ry="3.5" fill="currentColor"/>
            
            {/* 猫爪图案 - 四个脚趾垫 */}
            <ellipse cx="7.5" cy="9" rx="2.2" ry="3" fill="currentColor"/>
            <ellipse cx="12" cy="6.5" rx="2.2" ry="3" fill="currentColor"/>
            <ellipse cx="16.5" cy="9" rx="2.2" ry="3" fill="currentColor"/>
            <ellipse cx="12" cy="12" rx="1.8" ry="2.5" fill="currentColor"/>
        </svg>
    );

    return (
        <div className="flex justify-center items-center">
            <motion.div
                animate="jump"
                transition={{ staggerChildren: 0.15, staggerDirection: 1 }}
                className="flex justify-center items-center gap-4"
            >
                <motion.div 
                    className="text-pet-pink drop-shadow-sm" 
                    variants={pawVariants}
                >
                    <PawIcon />
                </motion.div>
                <motion.div 
                    className="text-pet-peach drop-shadow-sm" 
                    variants={pawVariants}
                >
                    <PawIcon />
                </motion.div>
                <motion.div 
                    className="text-pet-yellow drop-shadow-sm" 
                    variants={pawVariants}
                >
                    <PawIcon />
                </motion.div>
            </motion.div>
        </div>
    );
}

export default PawLoadingAnimation; 