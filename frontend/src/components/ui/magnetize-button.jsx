import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const useMagnetizeEffect = (particleCount = 12, enabled = true) => {
  const [isAttracting, setIsAttracting] = useState(false);
  const [particles, setParticles] = useState([]);
  const particlesControl = useAnimation();

  useEffect(() => {
    if (!enabled) return;
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 360 - 180,
      y: Math.random() * 360 - 180,
    }));
    setParticles(newParticles);
  }, [particleCount, enabled]);

  const handleInteractionStart = useCallback(async () => {
    if (!enabled) return;
    setIsAttracting(true);
    await particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10,
      },
    });
  }, [particlesControl, enabled]);

  const handleInteractionEnd = useCallback(async () => {
    if (!enabled) return;
    setIsAttracting(false);
    await particlesControl.start((i) => ({
      x: particles[i]?.x || 0,
      y: particles[i]?.y || 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }));
  }, [particlesControl, particles, enabled]);

  return {
    isAttracting,
    particles,
    particlesControl,
    handleInteractionStart,
    handleInteractionEnd,
  };
};

const MagnetizeButton = React.forwardRef(
  ({ className, children, particleCount = 12, magnetize = true, ...props }, ref) => {
    const {
      isAttracting,
      particles,
      particlesControl,
      handleInteractionStart,
      handleInteractionEnd,
    } = useMagnetizeEffect(particleCount, magnetize);

    return (
      <button
        ref={ref}
        className={cn("relative touch-none overflow-hidden", className)}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        {...props}
      >
        {magnetize && particles.map((particle, index) => (
          <motion.div
            key={index}
            custom={index}
            initial={{ x: particle.x, y: particle.y }}
            animate={particlesControl}
            className={cn(
              "absolute w-1.5 h-1.5 rounded-full pointer-events-none",
              "bg-indigo-400 transition-opacity duration-300",
              isAttracting ? "opacity-100" : "opacity-30"
            )}
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-3px",
              marginTop: "-3px",
            }}
          />
        ))}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

MagnetizeButton.displayName = "MagnetizeButton";

export { MagnetizeButton, useMagnetizeEffect };
