"use client"

import React from "react"
import { motion } from "framer-motion"

function LoadingCatJumping() {
    const jumpVariants = {
        initial: { y: 0 },
        animate: { y: -30 }
    }

    return (
        <div className="flex justify-center items-center gap-4">
            <motion.div
                className="text-4xl"
                variants={jumpVariants}
                initial="initial"
                animate="animate"
                transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
            >
                🐱
            </motion.div>
            <motion.div
                className="text-4xl"
                variants={jumpVariants}
                initial="initial"
                animate="animate"
                transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.2
                }}
            >
                🐱
            </motion.div>
            <motion.div
                className="text-4xl"
                variants={jumpVariants}
                initial="initial"
                animate="animate"
                transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.4
                }}
            >
                🐱
            </motion.div>
        </div>
    )
}

export default LoadingCatJumping 