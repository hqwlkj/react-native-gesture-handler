import { AdaptedEvent, Point } from '../interfaces';
import VelocityTracker from './VelocityTracker';

export interface TrackerElement {
  abosoluteCoords: Point;
  relativeCoords: Point;
  timestamp: number;
  velocityX: number;
  velocityY: number;
}

const MAX_POINTERS = 20;

export default class PointerTracker {
  private velocityTracker = new VelocityTracker();
  private readonly _trackedPointers: Map<number, TrackerElement> = new Map<
    number,
    TrackerElement
  >();

  private touchEventsIds: Map<number, number> = new Map<number, number>();

  private lastMovedPointerId: number;

  private cachedAbsoluteAverages: Point = { x: 0, y: 0 };
  private cachedRelativeAverages: Point = { x: 0, y: 0 };

  public constructor() {
    this.lastMovedPointerId = NaN;

    for (let i = 0; i < MAX_POINTERS; ++i) {
      this.touchEventsIds.set(i, NaN);
    }
  }

  public addToTracker(event: AdaptedEvent): void {
    if (this.trackedPointers.has(event.pointerId)) {
      return;
    }

    this.lastMovedPointerId = event.pointerId;

    const newElement: TrackerElement = {
      abosoluteCoords: { x: event.x, y: event.y },
      relativeCoords: { x: event.offsetX, y: event.offsetY },
      timestamp: event.time,
      velocityX: 0,
      velocityY: 0,
    };

    this.trackedPointers.set(event.pointerId, newElement);
    this.mapTouchEventId(event.pointerId);

    this.cachedAbsoluteAverages = this.getAbsoluteCoordsAverage();
    this.cachedRelativeAverages = this.getRelativeCoordsAverage();
  }

  public removeFromTracker(pointerId: number): void {
    this.trackedPointers.delete(pointerId);
    this.removeMappedTouchId(pointerId);
  }

  public track(event: AdaptedEvent): void {
    const pointerData = this.trackedPointers.get(event.pointerId);

    if (!pointerData) {
      return;
    }

    this.lastMovedPointerId = event.pointerId;

    this.velocityTracker.add(event);
    const [velocityX, velocityY] = this.velocityTracker.velocity;

    pointerData.velocityX = velocityX;
    pointerData.velocityY = velocityY;

    pointerData.abosoluteCoords = { x: event.x, y: event.y };
    pointerData.relativeCoords = { x: event.offsetX, y: event.offsetY };

    this.trackedPointers.set(event.pointerId, pointerData);

    this.cachedAbsoluteAverages = this.getAbsoluteCoordsAverage();
    this.cachedRelativeAverages = this.getRelativeCoordsAverage();
  }

  // Mapping TouchEvents ID
  private mapTouchEventId(id: number): void {
    for (const [mappedId, touchId] of this.touchEventsIds) {
      if (isNaN(touchId)) {
        this.touchEventsIds.set(mappedId, id);
        break;
      }
    }
  }

  private removeMappedTouchId(id: number): void {
    const mappedId: number = this.getMappedTouchEventId(id);
    if (!isNaN(mappedId)) {
      this.touchEventsIds.set(mappedId, NaN);
    }
  }

  public getMappedTouchEventId(touchEventId: number): number {
    for (const [key, value] of this.touchEventsIds.entries()) {
      if (value === touchEventId) {
        return key;
      }
    }

    return NaN;
  }

  public getVelocity(pointerId: number) {
    const pointerData = this.trackedPointers.get(pointerId);

    return pointerData
      ? {
          x: pointerData.velocityX,
          y: pointerData.velocityY,
        }
      : null;
  }

  public getLastAbsoluteCoords(pointerId?: number) {
    return this.trackedPointers.get(pointerId ?? this.lastMovedPointerId)
      ?.abosoluteCoords;
  }

  public getLastRelativeCoords(pointerId?: number) {
    return this.trackedPointers.get(pointerId ?? this.lastMovedPointerId)
      ?.relativeCoords;
  }

  // Some handlers use these methods to send average values in native event.
  // This may happen when pointers have already been removed from tracker (i.e. pointerup event).
  // In situation when NaN would be sent as a response, we return cached value.
  // That prevents handlers from crashing

  public getAbsoluteCoordsAverage() {
    const coordsSum = this.getAbsoluteCoordsSum();

    const avgX = coordsSum.x / this.trackedPointers.size;
    const avgY = coordsSum.y / this.trackedPointers.size;

    const averages = {
      x: isNaN(avgX) ? this.cachedAbsoluteAverages.x : avgX,
      y: isNaN(avgY) ? this.cachedAbsoluteAverages.y : avgY,
    };

    return averages;
  }

  public getRelativeCoordsAverage() {
    const coordsSum = this.getRelativeCoordsSum();

    const avgX = coordsSum.x / this.trackedPointers.size;
    const avgY = coordsSum.y / this.trackedPointers.size;

    const averages = {
      x: isNaN(avgX) ? this.cachedRelativeAverages.x : avgX,
      y: isNaN(avgY) ? this.cachedRelativeAverages.y : avgY,
    };

    return averages;
  }

  public getAbsoluteCoordsSum(ignoredPointer?: number) {
    const sum = { x: 0, y: 0 };

    this.trackedPointers.forEach((value, key) => {
      if (key !== ignoredPointer) {
        sum.x += value.abosoluteCoords.x;
        sum.y += value.abosoluteCoords.y;
      }
    });

    return sum;
  }

  public getRelativeCoordsSum(ignoredPointer?: number) {
    const sum = { x: 0, y: 0 };

    this.trackedPointers.forEach((value, key) => {
      if (key !== ignoredPointer) {
        sum.x += value.relativeCoords.x;
        sum.y += value.relativeCoords.y;
      }
    });

    return sum;
  }

  public resetTracker(): void {
    this.velocityTracker.reset();
    this.trackedPointers.clear();
    this.lastMovedPointerId = NaN;

    for (let i = 0; i < MAX_POINTERS; ++i) {
      this.touchEventsIds.set(i, NaN);
    }
  }

  public static shareCommonPointers(
    stPointers: number[],
    ndPointers: number[]
  ): boolean {
    return stPointers.some((pointerId) => ndPointers.includes(pointerId));
  }

  public get trackedPointersCount(): number {
    return this.trackedPointers.size;
  }

  public get trackedPointersIDs() {
    const keys: number[] = [];

    this.trackedPointers.forEach((_value, key) => {
      keys.push(key);
    });

    return keys;
  }

  public get trackedPointers() {
    return this._trackedPointers;
  }
}
