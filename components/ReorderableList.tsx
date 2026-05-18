/**
 * ReorderableList
 *
 * A generic, gesture-driven reorderable list built with
 * react-native-gesture-handler + react-native-reanimated.
 *
 * Supports items with VARIABLE heights.
 *
 * Usage:
 *
 *   <ReorderableList
 *     items={myItems}
 *     keyExtractor={(item) => item.id}
 *     itemHeight={(item) => item.isExpanded ? 120 : 72}   // fixed number or per-item fn
 *     onReorder={(reordered) => console.log(reordered)}
 *     renderItem={({ item, isDragging }) => <MyRow item={item} />}
 *   />
 *
 * The ScrollView can be rendered inside an outer ScrollView by wrapping in a
 * <GestureHandlerRootView>. If a parent already provides the root, pass
 * `skipGestureRoot` to avoid nesting roots.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import Animated, {
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { clamp, FAST_SPRING } from "@/lib/dragAndDropUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReorderableListProps<T> {
  /** Ordered data array */
  items: T[];
  /** Stable key for each item (must be unique) */
  keyExtractor: (item: T) => string;
  /**
   * Height of each item in pixels.
   * Pass a number for uniform height or a function for variable heights.
   */
  itemHeight: number | ((item: T) => number);
  /** Render each item. `isDragging` is a SharedValue that is true while dragged. */
  renderItem: (args: {
    item: T;
    index: number;
    isDragging: SharedValue<boolean>;
  }) => React.ReactNode;
  /** Called after the user drops an item with the new ordered array. */
  onReorder: (reordered: T[]) => void;
  /** Gap between items in pixels (default 0). */
  gap?: number;
  /** Padding inside the ScrollView's contentContainer (default 16). */
  contentPadding?: number;
  /** If true, skips rendering GestureHandlerRootView (when a parent already provides it). */
  skipGestureRoot?: boolean;
  /** Style forwarded to the outer ScrollView content container */
  contentContainerStyle?: object;
  /** Optional static left column to scroll alongside the reorderable items */
  renderLeftColumn?: () => React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a map of { [key]: pixelOffset } for a given ordered items array */
function buildOffsetMap(
  items: { key: string; height: number; gap: number }[],
): Record<string, number> {
  const map: Record<string, number> = {};
  let acc = 0;
  for (const item of items) {
    map[item.key] = acc;
    acc += item.height + item.gap;
  }
  return map;
}

/** Swap two entries in an offset map by their pixel values */
function swapByOffset(
  offsets: Record<string, number>,
  fromOffset: number,
  toOffset: number,
): Record<string, number> {
  "worklet";
  const next = { ...offsets };
  for (const k in next) {
    if (next[k] === fromOffset) next[k] = toOffset;
    else if (next[k] === toOffset) next[k] = fromOffset;
  }
  return next;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReorderableList<T>({
  items,
  keyExtractor,
  itemHeight,
  renderItem,
  onReorder,
  gap = 0,
  contentPadding = 16,
  skipGestureRoot = false,
  contentContainerStyle,
  renderLeftColumn,
}: ReorderableListProps<T>) {
  // ── Derived per-item metadata (key + resolved height) ──────────────────────
  const itemMeta = useMemo(
    () =>
      items.map((item) => ({
        key: keyExtractor(item),
        height: typeof itemHeight === "function" ? itemHeight(item) : itemHeight,
        gap,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, itemHeight, gap],
  );

  const totalHeight = useMemo(
    () => itemMeta.reduce((sum, m) => sum + m.height + m.gap, 0) - gap,
    [itemMeta, gap],
  );

  const initialOffsets = useMemo(() => buildOffsetMap(itemMeta), [itemMeta]);

  // ── Shared values ──────────────────────────────────────────────────────────
  const offsets = useSharedValue<Record<string, number>>(initialOffsets);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  // Keep items in React state so we can call onReorder on the JS thread
  const [internalItems, setInternalItems] = useState<T[]>(items);
  const itemsRef = useRef<T[]>(items);
  const metaRef = useRef(itemMeta);

  // Sync when parent changes items (e.g. after a save)
  useEffect(() => {
    itemsRef.current = items;
    metaRef.current = itemMeta;
    setInternalItems(items);
    offsets.value = buildOffsetMap(itemMeta);
  }, [items, itemMeta]);

  const handleScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // ── onDragEnd (JS thread) ──────────────────────────────────────────────────
  const onDragEnd = useCallback(
    (finalOffsets: Record<string, number>) => {
      const currentItems = itemsRef.current;
      const currentMeta = metaRef.current;

      // Sort by current pixel offset to get the new order
      const sorted = [...currentItems].sort((a, b) => {
        const ka = keyExtractor(a);
        const kb = keyExtractor(b);
        return (finalOffsets[ka] ?? 0) - (finalOffsets[kb] ?? 0);
      });

      // Recompute canonical offsets for the new order (keeps heights correct)
      const newMeta = sorted.map((item) => {
        const key = keyExtractor(item);
        const found = currentMeta.find((m) => m.key === key)!;
        return { key, height: found.height, gap };
      });
      const newOffsets = buildOffsetMap(newMeta);

      setInternalItems(sorted);
      offsets.value = newOffsets;
      onReorder(sorted);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onReorder, gap],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const content = (
    <Animated.ScrollView
      ref={scrollViewRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { padding: contentPadding },
        contentContainerStyle,
      ]}
    >
      <View style={{ flexDirection: "row" }}>
        {renderLeftColumn && renderLeftColumn()}
        <View style={{ height: totalHeight, position: "relative", flex: 1 }}>
          {internalItems.map((item, index) => {
            const key = keyExtractor(item);
            const meta = itemMeta.find((m) => m.key === key);
            const height = meta?.height ?? 72;

            return (
              <ReorderableItem
                key={key}
                id={key}
                height={height}
                initialOffset={initialOffsets[key] ?? 0}
                offsets={offsets}
                itemMeta={itemMeta}
                scrollY={scrollY}
                scrollViewRef={scrollViewRef}
                onDragEnd={onDragEnd}
                renderItem={(isDragging) =>
                  renderItem({ item, index, isDragging })
                }
              />
            );
          })}
        </View>
      </View>
    </Animated.ScrollView>
  );

  if (skipGestureRoot) return content;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
  );
}

// ─── ReorderableItem ──────────────────────────────────────────────────────────

interface ReorderableItemProps {
  id: string;
  height: number;
  initialOffset: number;
  offsets: SharedValue<Record<string, number>>;
  itemMeta: { key: string; height: number; gap: number }[];
  scrollY: SharedValue<number>;
  scrollViewRef: any;
  onDragEnd: (offsets: Record<string, number>) => void;
  renderItem: (isDragging: SharedValue<boolean>) => React.ReactNode;
}

function ReorderableItem({
  id,
  height,
  initialOffset,
  offsets,
  itemMeta,
  scrollY,
  scrollViewRef,
  onDragEnd,
  renderItem,
}: ReorderableItemProps) {
  const isDragging = useSharedValue(false);
  const dragStartY = useSharedValue(0);
  const top = useSharedValue(initialOffset);

  // Keep all item heights available on the worklet side
  const metaShared = useSharedValue(itemMeta);
  useEffect(() => {
    metaShared.value = itemMeta;
  }, [itemMeta]);

  // React to external position changes (e.g. after save / week change)
  useAnimatedReaction(
    () => offsets.value[id],
    (newOffset, prevOffset) => {
      if (newOffset !== prevOffset && !isDragging.value) {
        top.value = withSpring(newOffset ?? 0, FAST_SPRING);
      }
    },
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      isDragging.value = true;
      dragStartY.value = top.value;
    })
    .onUpdate((e) => {
      const meta = metaShared.value;
      const totalListHeight = meta.reduce((s, m) => s + m.height + m.gap, 0) - (meta[0]?.gap ?? 0);
      const maxTop = totalListHeight - height;

      const newTop = clamp(dragStartY.value + e.translationY, 0, maxTop);
      top.value = newTop;

      // Auto-scroll the parent ScrollView
      scrollTo(scrollViewRef, 0, newTop + scrollY.value - 150, false);

      // Find which slot the dragged item is hovering over
      // by checking mid-point of dragged item against each item's offset range
      const myMidpoint = newTop + height / 2;
      let targetOffset = offsets.value[id];

      for (const m of meta) {
        const itemTop = offsets.value[m.key] ?? 0;
        const itemBottom = itemTop + m.height;
        if (myMidpoint >= itemTop && myMidpoint < itemBottom && m.key !== id) {
          targetOffset = itemTop;
          break;
        }
      }

      const currentOffset = offsets.value[id];
      if (targetOffset !== currentOffset) {
        offsets.value = swapByOffset(offsets.value, currentOffset, targetOffset);
      }
    })
    .onEnd(() => {
      top.value = withSpring(offsets.value[id] ?? 0, FAST_SPRING);
      isDragging.value = false;
      runOnJS(onDragEnd)(offsets.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: top.value,
    left: 0,
    right: 0,
    height,
    zIndex: isDragging.value ? 100 : 1,
    shadowOpacity: withSpring(isDragging.value ? 0.2 : 0),
    shadowRadius: 12,
    shadowColor: "#000",
    elevation: isDragging.value ? 8 : 0,
    transform: [{ scale: withSpring(isDragging.value ? 1.025 : 1, FAST_SPRING) }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {renderItem(isDragging)}
      </Animated.View>
    </GestureDetector>
  );
}
