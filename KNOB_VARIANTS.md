# Knob Variants - Usage Guide

This document provides examples for using the specialized knob components in OscilloSynth.

## Available Knob Variants

### 1. BipolarKnob
For values centered at 0 (e.g., pan, detune, pitch bend).

**Features:**
- Center marker at 0
- Dual-color gradient (red for negative, green for positive)
- Shows +/- sign in value display
- Arc displays from center to current value
- Double-click resets to 0 (center)

**Example Usage:**
```tsx
import { BipolarKnob } from './components/KnobVariants'

<BipolarKnob
  label="Detune"
  value={detune}
  min={-100}
  max={100}
  step={1}
  onChange={(value) => setDetune(value)}
  color="#00FF41"           // Color for positive values
  colorNegative="#FF4136"   // Color for negative values
  unit=" cents"
/>

<BipolarKnob
  label="Pan"
  value={pan}
  min={-1}
  max={1}
  step={0.05}
  onChange={(value) => setPan(value)}
  color="#00FF41"
  colorNegative="#FF4136"
/>
```

**Visual Behavior:**
- When value = 0: Pointer at 12 o'clock, no arc
- When value > 0: Green arc from center to value
- When value < 0: Red arc from value to center

---

### 2. LogKnob
For logarithmic values (e.g., frequency, filter cutoff).

**Features:**
- Logarithmic value mapping (linear drag → log value)
- Better control over wide ranges
- Keyboard arrows use multiplication (1.05x) instead of addition
- Smart formatting based on value magnitude
- Mouse wheel uses multiplication

**Example Usage:**
```tsx
import { LogKnob } from './components/KnobVariants'

<LogKnob
  label="Cutoff"
  value={cutoff}
  min={20}
  max={20000}
  defaultValue={2000}
  onChange={(value) => setCutoff(value)}
  color="#00FF41"
  unit=" Hz"
/>

<LogKnob
  label="LFO Rate"
  value={lfoRate}
  min={0.01}
  max={40}
  defaultValue={1}
  onChange={(value) => setLfoRate(value)}
  color="#FFD700"
  unit=" Hz"
/>
```

**How Logarithmic Mapping Works:**
- A 440 Hz → 880 Hz (octave up) takes the same drag distance as 880 Hz → 1760 Hz
- Perfect for musical parameters (frequency, filter cutoff)
- Provides fine control at low values and coarse control at high values

**Value Formatting:**
- value >= 1000: `12345 Hz` (0 decimals)
- value >= 100: `456.7 Hz` (1 decimal)
- value < 100: `12.34 Hz` (2 decimals)

---

### 3. TimeKnob
For time values with automatic unit conversion.

**Features:**
- Automatic ms/s formatting
- Logarithmic scale (wraps LogKnob)
- Smart unit display based on value
- Values always in seconds internally

**Example Usage:**
```tsx
import { TimeKnob } from './components/KnobVariants'

<TimeKnob
  label="Attack"
  value={attack}
  min={0.001}      // 1ms
  max={10}         // 10s
  defaultValue={0.01}  // 10ms
  onChange={(value) => setAttack(value)}
  color="#00FF41"
/>

<TimeKnob
  label="Delay Time"
  value={delayTime}
  min={0.001}      // 1ms
  max={2}          // 2s
  defaultValue={0.25}  // 250ms
  onChange={(value) => setDelayTime(value)}
  color="#FFD700"
/>
```

**Unit Conversion:**
- value < 1s: Display in ms (e.g., `250ms`)
  - value * 1000 < 10: 1 decimal (`2.5ms`)
  - value * 1000 >= 10: 0 decimals (`250ms`)
- value >= 1s: Display in s (e.g., `1.5s`)
  - value < 10: 2 decimals (`1.50s`)
  - value >= 10: 1 decimal (`10.0s`)

---

### 4. PercentageKnob
For percentage values (0-100%).

**Features:**
- Fixed 0-100% range
- Always shows % sign
- Integer values only
- Simple linear mapping

**Example Usage:**
```tsx
import { PercentageKnob } from './components/KnobVariants'

<PercentageKnob
  label="Level"
  value={level}
  defaultValue={50}
  onChange={(value) => setLevel(value)}
  color="#00FF41"
/>

<PercentageKnob
  label="Mix"
  value={mix}
  defaultValue={30}
  onChange={(value) => setMix(value)}
  color="#FFD700"
/>
```

**Behavior:**
- No need to specify min/max (always 0-100)
- No need to specify step (always 1)
- No need to specify unit (always "%")
- Values are always integers

---

## Common Features (All Knobs)

All knob variants support these features:

### Adaptive Sensitivity
- **Normal mode**: Standard drag speed
- **Fine mode (Shift)**: 5x slower for precise adjustments
- **Ultra-fine mode (Shift+Ctrl)**: 25x slower for micro-adjustments
- Visual indicator appears during drag to show current mode

### Double-Click Reset
- Double-click knob to reset to default value
- Bounce animation confirms reset
- Default value:
  - BipolarKnob: Always 0
  - LogKnob: Geometric mean (√(min × max)) if not specified
  - TimeKnob: User-specified or geometric mean
  - PercentageKnob: User-specified or 50

### Click-to-Edit
- Click on value display to enter edit mode
- Type exact value and press Enter
- Press Escape to cancel
- Input is validated and clamped to valid range

### Keyboard Control
- Arrow Up/Right: Increase value
- Arrow Down/Left: Decrease value
- Hold Shift for smaller increments
- Focus required (click knob area first)

### Mouse Wheel
- Scroll up: Increase value
- Scroll down: Decrease value
- Hold Shift for smaller increments
- Cursor must be over knob

---

## Migration from Standard Knob

### When to Use Each Variant

**Use BipolarKnob when:**
- Value represents deviation from center (detune, pan, pitch bend)
- min is negative and max is positive
- User needs visual feedback about positive/negative state

**Use LogKnob when:**
- Value spans multiple orders of magnitude (20-20000 Hz)
- Musical/exponential relationship (frequency, filter cutoff)
- Linear drag feels "too fast" at high values or "too slow" at low values

**Use TimeKnob when:**
- Value represents time duration
- Need automatic ms/s conversion
- Values range from milliseconds to seconds

**Use PercentageKnob when:**
- Value is always 0-100%
- No other range makes sense (level, mix, modulation depth)
- Simplified API is preferred

**Use Standard Knob when:**
- None of the above apply
- Linear mapping is appropriate
- Custom range is needed

### Migration Examples

**Before (Standard Knob):**
```tsx
<Knob
  label="Cutoff"
  value={cutoff}
  min={20}
  max={20000}
  step={1}
  onChange={setCutoff}
  color="#00FF41"
  unit=" Hz"
/>
```

**After (LogKnob):**
```tsx
<LogKnob
  label="Cutoff"
  value={cutoff}
  min={20}
  max={20000}
  onChange={setCutoff}
  color="#00FF41"
  unit=" Hz"
/>
// Note: No step parameter needed for LogKnob
```

---

**Before (Standard Knob):**
```tsx
<Knob
  label="Attack"
  value={attack}
  min={0.001}
  max={10}
  step={0.001}
  onChange={setAttack}
  color="#00FF41"
  unit="s"
/>
```

**After (TimeKnob):**
```tsx
<TimeKnob
  label="Attack"
  value={attack}
  min={0.001}
  max={10}
  onChange={setAttack}
  color="#00FF41"
/>
// Note: Automatic ms/s formatting, no unit parameter needed
```

---

## Implementation Details

### BipolarKnob
- Dual arc rendering based on sign of value
- Center tick mark highlighted at 0 position
- Color switches between positive/negative color props
- Value display shows +/- prefix

### LogKnob
- Internal conversion: `normalizedValue = (log(value) - log(min)) / (log(max) - log(min))`
- Drag delta applied in log space, then converted back to linear
- Keyboard/wheel use multiplication instead of addition
- Smart formatting prevents excessive decimal places

### TimeKnob
- Wraps LogKnob with time-specific formatting
- Value always stored in seconds
- Display unit chosen at render time based on magnitude
- Logarithmic scale inherited from LogKnob

### PercentageKnob
- Simplified version of standard Knob
- Fixed range eliminates configuration
- Forces integer values with Math.round()
- Hardcoded "%" unit

---

## Performance Notes

All knob variants are optimized for 60 FPS interaction:
- SVG rendering with hardware-accelerated transforms
- Minimal re-renders (only on value change)
- Efficient event handlers with useEffect cleanup
- Debounced drag calculations

---

## Accessibility

All variants support:
- Keyboard navigation (arrows)
- Focus indicators
- Click-to-edit for precise entry
- Visual feedback for all interactions
- Semantic HTML structure

---

## Examples in OscilloSynth Codebase

### Currently Using Standard Knob (Good Candidates for Migration)

**Filter Cutoff** (should use LogKnob):
```tsx
// Current
<Knob label="Cutoff" value={cutoff} min={20} max={20000} ... />

// Recommended
<LogKnob label="Cutoff" value={cutoff} min={20} max={20000} ... />
```

**ADSR Envelope Times** (should use TimeKnob):
```tsx
// Current
<Knob label="Attack" value={attack} min={0.001} max={10} unit="s" ... />

// Recommended
<TimeKnob label="Attack" value={attack} min={0.001} max={10} ... />
```

**Operator Level** (already appropriate with standard Knob):
```tsx
// Current (good as-is)
<Knob label="Level" value={level} min={0} max={100} step={1} unit="%" ... />

// Could simplify with PercentageKnob
<PercentageKnob label="Level" value={level} ... />
```

---

## Testing Recommendations

When integrating these variants:

1. **BipolarKnob**: Test that center position (0) is visually clear
2. **LogKnob**: Verify musical intervals (octaves) feel consistent
3. **TimeKnob**: Check ms/s transition point (1 second)
4. **PercentageKnob**: Ensure integer-only behavior

All variants should:
- Reset correctly on double-click
- Show sensitivity indicator during modified drag
- Accept keyboard input
- Validate edit mode input
- Clamp to valid range
