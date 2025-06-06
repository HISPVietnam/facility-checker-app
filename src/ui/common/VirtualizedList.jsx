import React, { useRef, useState } from "react";
import {
  DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST,
  DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
} from "@/const";

const VirtualizedList = ({
  items,
  selected = [],
  onSelect,
  renderItem,
  itemHeight = DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST,
  visibleItemCount = DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
  maxHeight,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef(null);
  const height = maxHeight || itemHeight * visibleItemCount;
  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(items.length, startIndex + visibleItemCount + 1);
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      className="overflow-y-auto"
      style={{ height: `${height}px` }}
      onScroll={handleScroll}
      ref={listRef}
    >
      <div className="relative" style={{ height: totalHeight }}>
        <div
          className="absolute left-0 right-0"
          style={{ top: `${startIndex * itemHeight}px` }}
        >
          {visibleItems.map((item, i) => (
            <div
              style={{
                height: `${itemHeight}px`,
              }}
            >
              {renderItem({
                item,
                index: i + startIndex,
                isSelected: selected.includes(item.value),
                onSelect,
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualizedList;
