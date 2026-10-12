import { MotionValue } from "framer-motion";

export interface BackgroundLayerProps {
  isReducedMotion?: boolean;
}

export interface LightingLayerProps extends BackgroundLayerProps {
  /** Slow-plane parallax X from useHeroMotion (optional — falls back to static) */
  lightX?: MotionValue<number>;
  /** Slow-plane parallax Y from useHeroMotion (optional — falls back to static) */
  lightY?: MotionValue<number>;
}
