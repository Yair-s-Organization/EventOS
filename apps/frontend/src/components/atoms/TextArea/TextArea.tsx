import { useCallback, useLayoutEffect, useRef } from "react";
import type {
  InputEvent,
  TextareaHTMLAttributes,
} from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  hasError?: boolean;
  autoResize?: boolean;
}

const textStyle = "font-merriweather text-[16px]";

export function TextArea({
  className = "",
  hasError = false,
  autoResize = false,
  onInput,
  style,
  value,
  ...restOfProps
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = "auto";
    const computedStyle = window.getComputedStyle(textarea);
    const borderHeight =
      parseFloat(computedStyle.borderTopWidth) +
      parseFloat(computedStyle.borderBottomWidth);
    const paddingHeight =
      parseFloat(computedStyle.paddingTop) +
      parseFloat(computedStyle.paddingBottom);
    const height =
      textarea.scrollHeight +
      (computedStyle.boxSizing === "border-box" ? borderHeight : -paddingHeight);

    textarea.style.height = `${height}px`;
  }, [autoResize]);

  useLayoutEffect(() => {
    if (!autoResize) return;

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [autoResize, resize, value]);

  const handleInput = (event: InputEvent<HTMLTextAreaElement>) => {
    onInput?.(event);
    resize();
  };

  return (
    <textarea
      ref={textareaRef}
      className={`w-full rounded-lg border-2 p-3 text-sm outline-none transition-colors focus:ring-2 ${
        hasError 
            ? "border-eventos-error focus:border-eventos-error focus:ring-red-200" 
            : "border-secondary focus:ring-blue-100"}
        ${textStyle} 
        ${className}`}
      onInput={handleInput}
      style={{
        ...style,
        overflowY: autoResize ? "hidden" : style?.overflowY,
      }}
      value={value}
      {...restOfProps}
    />
  );
}
