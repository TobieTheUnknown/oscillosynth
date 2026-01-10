/**
 * Icon component - Displays SVG icons with consistent styling
 */

import { type FC, type SVGProps } from 'react';

// Import SVG icons as React components (vite-plugin-svgr)
import WaveSine from '../assets/icons/wave-sine.svg?react';
import WaveSquare from '../assets/icons/wave-square.svg?react';
import WaveSawtooth from '../assets/icons/wave-sawtooth.svg?react';
import WaveTriangle from '../assets/icons/wave-triangle.svg?react';
import WaveRandom from '../assets/icons/wave-random.svg?react';
import Play from '../assets/icons/play.svg?react';
import Pause from '../assets/icons/pause.svg?react';
import Stop from '../assets/icons/stop.svg?react';
import Speaker from '../assets/icons/speaker.svg?react';

const icons = {
  'wave-sine': WaveSine,
  'wave-square': WaveSquare,
  'wave-sawtooth': WaveSawtooth,
  'wave-triangle': WaveTriangle,
  'wave-random': WaveRandom,
  play: Play,
  pause: Pause,
  stop: Stop,
  speaker: Speaker,
} as const;

export type IconName = keyof typeof icons;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon: FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  ...props
}) => {
  const IconComponent = icons[name];

  return (
    <IconComponent
      width={size}
      height={size}
      className={`icon ${className}`}
      {...props}
    />
  );
};
