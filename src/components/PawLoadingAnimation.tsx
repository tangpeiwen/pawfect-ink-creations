import { motion, Variants } from "framer-motion";

function PawLoadingAnimation() {
    const pawVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.3,
            y: 10,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            scale: 0.3,
            y: -10,
            transition: {
                duration: 0.3,
                ease: "easeIn",
            },
        },
    };

    const containerVariants: Variants = {
        start: {
            transition: {
                staggerChildren: 0.6,
                repeat: Infinity,
                repeatDelay: 0.8,
            },
        },
    };

    const PawIcon = () => (
        <svg 
            width="32" 
            height="32" 
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
                variants={containerVariants}
                initial="start"
                animate="start"
                className="flex justify-center items-center gap-6"
            >
                <motion.div 
                    className="text-pet-pink drop-shadow-sm" 
                    variants={pawVariants}
                    initial="hidden"
                    animate={["visible", "exit"]}
                    transition={{
                        repeat: Infinity,
                        repeatDelay: 1.4,
                        delay: 0,
                    }}
                >
                    <PawIcon />
                </motion.div>
                <motion.div 
                    className="text-pet-peach drop-shadow-sm" 
                    variants={pawVariants}
                    initial="hidden"
                    animate={["visible", "exit"]}
                    transition={{
                        repeat: Infinity,
                        repeatDelay: 1.4,
                        delay: 0.6,
                    }}
                >
                    <PawIcon />
                </motion.div>
                <motion.div 
                    className="text-pet-yellow drop-shadow-sm" 
                    variants={pawVariants}
                    initial="hidden"
                    animate={["visible", "exit"]}
                    transition={{
                        repeat: Infinity,
                        repeatDelay: 1.4,
                        delay: 1.2,
                    }}
                >
                    <PawIcon />
                </motion.div>
            </motion.div>
        </div>
    );
}

export default PawLoadingAnimation; 