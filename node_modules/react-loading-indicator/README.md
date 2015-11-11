# React Loading Indicator

This is a loading indicator written purely in React that uses SVG and no images. It runs only on web (not React Native).

![loading-indicator](https://cloud.githubusercontent.com/assets/379606/10749832/e3d88020-7c2b-11e5-9a43-42a92fa27d07.gif)

By default, its size is 20x20. Basic usage is simple: `<LoadingIndicator />`.

## Props

### color

The color of the most solid segment—what we call each spoke of the loading indicator. The `color` prop is an object with four keys: `red`, `green`, `blue`, and `alpha`. The first three color components are values between 0 and 255, inclusive. The alpha component is a value between 0 and 1, inclusive.

### segments

The number of segments, evenly spaced from each other.

### segmentWidth

The width of each segment, in logical pixels.

### segmentLength

The length of each segment, in logical pixels.

### spacing

Extra spacing to pad the distance between the center of the loading indicator and each segment, in logical pixels.

### fadeTo

The alpha multiplier of the faintest segments. Each segment's color is determined by multiplying the alpha channel of the `color` prop by a gradually decreasing alpha multiplier that starts at 1 and linearly decreases to the `fadeTo` prop.

### fadeSteps

The number of steps between segments from the boldest segment to the faintest segments. If `fadeSteps` is `segments - 1` then only the last segment will be the faintest, multiplied by `fadeTo`. If `fadeSteps` is a lower value, then several of the last segments will all have the faintest opacity.
