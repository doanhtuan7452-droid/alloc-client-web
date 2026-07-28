import { useState, useCallback, useEffect, useRef } from "react";

const LOCAL_STORAGE_WIDTH_KEY = "alloc_ai_chat_panel_width_v2";
const LOCAL_STORAGE_COLLAPSED_KEY = "alloc_ai_chat_panel_collapsed";

const DEFAULT_WIDTH = 160;
const MIN_WIDTH = 140;
const MAX_WIDTH = 220;

/**
 * Custom hook xử lý kéo thả thay đổi kích thước panel và thu gọn sidebar độc lập
 */
export function useResizablePanel({
  minWidth = MIN_WIDTH,
  maxWidth = MAX_WIDTH,
  defaultWidth = DEFAULT_WIDTH,
} = {}) {
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_WIDTH_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        return parsed;
      }
    }
    return defaultWidth;
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_COLLAPSED_KEY);
    return saved === "true";
  });

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(panelWidth);

  // Lưu trữ độ rộng khi thay đổi
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_WIDTH_KEY, panelWidth.toString());
  }, [panelWidth]);

  // Lưu trữ trạng thái thu gọn
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COLLAPSED_KEY, isCollapsed.toString());
  }, [isCollapsed]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      // Ngăn bôi đen văn bản khi đang kéo rê
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = panelWidth;

      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        let newWidth = startWidthRef.current + deltaX;

        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;

        setPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [panelWidth, minWidth, maxWidth]
  );

  return {
    panelWidth,
    isCollapsed,
    setIsCollapsed,
    toggleCollapse,
    handleMouseDown,
    isResizing,
  };
}
