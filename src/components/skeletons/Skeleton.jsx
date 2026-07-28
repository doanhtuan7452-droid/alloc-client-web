import { cn } from "../../utils/cn";

export default function Skeleton({
  className,
  variant = "rect", // "rect" | "circle" | "text"
  width,
  height,
  radius,
  ...props
}) {
  const styles = {
    width: width,
    height: height,
    borderRadius: radius,
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-skeleton shrink-0",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-3 rounded w-full",
        variant === "rect" && "rounded-lg",
        className
      )}
      style={styles}
      {...props}
    />
  );
}
