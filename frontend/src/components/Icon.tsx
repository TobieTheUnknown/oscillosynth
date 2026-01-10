/**
 * Icon component - Displays SVG icons with consistent styling
 */

import { type FC, type SVGProps } from 'react';

// Import SVG icons as React components
import { ReactComponent as WaveSine } from '../assets/icons/wave-sine.svg';
import { ReactComponent as WaveSquare } from '../assets/icons/wave-square.svg';
import { ReactComponent as WaveSawtooth } from '../assets/icons/wave-sawtooth.svg';
import { ReactComponent as WaveTriangle } from '../assets/icons/wave-triangle.svg';
import { ReactComponent as WaveRandom } from '../assets/icons/wave-random.svg';
import { ReactComponent as Play } from '../assets/icons/play.svg';
import { ReactComponent as Pause } from '../assets/icons/pause.svg';
import { ReactComponent as Stop } from '../assets/icons/stop.svg';
import { ReactComponent as Speaker } from '../assets/icons/speaker.svg';

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
