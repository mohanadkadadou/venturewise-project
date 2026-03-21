import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreGauge({ score, size = 200, strokeWidth = 16 }: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Use a 270-degree arc instead of full circle
  const arcOffset = circumference * 0.25; 
  const dashArray = `${circumference - arcOffset} ${circumference}`;
  
  // Map score 0-100 to the visible arc
  const targetOffset = circumference - arcOffset - ((score / 100) * (circumference - arcOffset));

  let color = "#D4AF37"; // Gold default
  if (score < 40) color = "#ef4444"; // Red
  else if (score < 70) color = "#f59e0b"; // Yellow
  else if (score >= 90) color = "#10b981"; // Green

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-135 transform">
        {/* Background Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference - arcOffset }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="font-display font-bold text-5xl tracking-tighter"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}
