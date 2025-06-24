import { motion } from "framer-motion";

function PawLoadingAnimation() {
    const PawIcon = ({ delay = 0 }: { delay?: number }) => (
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
            }}
        >
            <svg 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
            >
                {/* 猫爪图案 - 主垫 */}
                <ellipse cx="12" cy="17" rx="4.5" ry="3.5" fill="currentColor"/>
                
                {/* 猫爪图案 - 四个脚趾垫 */}
                <ellipse cx="7.5" cy="9" rx="2.2" ry="3" fill="currentColor"/>
                <ellipse cx="12" cy="6.5" rx="2.2" ry="3" fill="currentColor"/>
                <ellipse cx="16.5" cy="9" rx="2.2" ry="3" fill="currentColor"/>
                <ellipse cx="12" cy="12" rx="1.8" ry="2.5" fill="currentColor"/>
            </svg>
        </motion.div>
    );

    return (
        <div className="flex justify-center items-center py-4">
            <div className="flex justify-center items-center gap-4">
                <div style={{ color: '#FF719A' }}>
                    <PawIcon delay={0} />
                </div>
                <div style={{ color: '#FFA99F' }}>
                    <PawIcon delay={0.3} />
                </div>
                <div style={{ color: '#FFE29F' }}>
                    <PawIcon delay={0.6} />
                </div>
            </div>
        </div>
    );
}

export default PawLoadingAnimation; 