/**
 * Icon component - Displays SVG icons with consistent styling
 */

import { type FC, type SVGProps } from 'react';

// Import SVG icons
import waveSine from '../assets/icons/wave-sine.svg';
import waveSquare from '../assets/icons/wave-square.svg';
import waveSawtooth from '../assets/icons/wave-sawtooth.svg';
import waveTriangle from '../assets/icons/wave-triangle.svg';
import waveRandom from '../assets/icons/wave-random.svg';
import play from '../assets/icons/play.svg';
import pause from '../assets/icons/pause.svg';
import stop from '../assets/icons/stop.svg';
import speaker from '../assets/icons/speaker.svg';

const icons = {
  'wave-sine': waveSine,
  'wave-square': waveSquare,
  'wave-sawtooth': waveSawtooth,
  'wave-triangle': waveTriangle,
  'wave-random': waveRandom,
  play,
  pause,
  stop,
  speaker,
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
  const iconSrc = icons[name];

  return (
    <img
      src={iconSrc}
      alt={name}
      width={size}
      height={size}
      className={`icon ${className}`}
      {...props}
    />
  );
};
