---
id: force-touch-gesture
title: Force touch gesture (iOS only)
sidebar_label: Force touch gesture
sidebar_position: 10
---

:::warning
ForceTouch gesture is depracted and will be removed in the future version of Gesture Handler.
:::

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseContinuousEventConfig from './\_shared/base-continuous-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinuousEventCallbacks from './\_shared/base-continuous-gesture-callbacks.md';

A continuous gesture that recognizes force of a touch. It allows for tracking pressure of touch on some iOS devices.
The gesture [activates](/packages/docs-gesture-handler/docs/fundamentals/states-events.mdx#active) when pressure of touch if greater or equal than `minForce`. It fails if pressure is greater than `maxForce`
Gesture callback can be used for continuous tracking of the touch pressure. It provides information for one finger (the first one).

At the beginning of the gesture, the pressure factor is 0.0. As the pressure increases, the pressure factor increases proportionally. The maximum pressure is 1.0.

There's no implementation provided on Android and it simply renders children without any wrappers.
Since this behaviour is only provided on some iOS devices, this gesture should not be used for defining any crucial behaviors. Use it only as an additional improvement and make all features to be accessed without this gesture as well.

## Reference

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

function App() {
  // highlight-next-line
  const forceTouch = Gesture.ForceTouch();

  return (
    <GestureDetector gesture={forceTouch}>
      <View />
    </GestureDetector>
  );
}
```

## Config

### Properties specific to `ForceTouchGesture`:

### `minForce(value: number)`

A minimal pressure that is required before gesture can [activate](/packages/docs-gesture-handler/docs/fundamentals/states-events.mdx#active). Should be a value from range `[0.0, 1.0]`. Default is `0.2`.

### `maxForce(value: number)`

A maximal pressure that could be applied for gesture. If the pressure is greater, gesture [fails](/packages/docs-gesture-handler/docs/fundamentals/states-events.mdx#failed). Should be a value from range `[0.0, 1.0]`.

### `feedbackOnActivation(value: boolean)`

Value defining if haptic feedback has to be performed on activation.

<BaseEventConfig />
<BaseContinuousEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinuousEventCallbacks />

## Event data

### Event attributes specific to `ForceTouchGesture`:

### `force`

The pressure of a touch.

<BaseEventData />
