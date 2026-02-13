import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-indigo-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const useMagnetizeEffect = (particleCount = 8, enabled = true) => {
  const [isAttracting, setIsAttracting] = React.useState(false);
  const [particles, setParticles] = React.useState([]);
  const particlesControl = useAnimation();

  React.useEffect(() => {
    if (!enabled) return;
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }));
    setParticles(newParticles);
  }, [particleCount, enabled]);

  const handleInteractionStart = React.useCallback(async () => {
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

  const handleInteractionEnd = React.useCallback(async () => {
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

const Button = React.forwardRef(({ className, variant, size, asChild = false, magnetize = false, particleCount = 8, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  
  const {
    isAttracting,
    particles,
    particlesControl,
    handleInteractionStart,
    handleInteractionEnd,
  } = useMagnetizeEffect(particleCount, magnetize);

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), "relative overflow-hidden", className)}
      ref={ref}
      onMouseEnter={magnetize ? handleInteractionStart : undefined}
      onMouseLeave={magnetize ? handleInteractionEnd : undefined}
      onTouchStart={magnetize ? handleInteractionStart : undefined}
      onTouchEnd={magnetize ? handleInteractionEnd : undefined}
      {...props}
    >
      {magnetize && particles.map((particle, index) => (
        <motion.div
          key={index}
          custom={index}
          initial={{ x: particle.x, y: particle.y }}
          animate={particlesControl}
          className={cn(
            "absolute w-1 h-1 rounded-full pointer-events-none",
            "bg-white/60 transition-opacity duration-300",
            isAttracting ? "opacity-100" : "opacity-20"
          )}
          style={{
            left: "50%",
            top: "50%",
            marginLeft: "-2px",
            marginTop: "-2px",
          }}
        />
      ))}
      <span className="relative z-10">{props.children}</span>
    </Comp>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };