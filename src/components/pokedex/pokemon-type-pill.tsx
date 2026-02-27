import { getTypeColor } from "@/lib/type-colors";
import { cn } from "@/lib/utils";

type Props = {
  typeName: string;
  size?: "sm" | "md";
  className?: string;
};

export function PokemonTypePill({ typeName, size = "md", className }: Props) {
  const color = getTypeColor(typeName);
  return (
    <span
      className={cn(
        "pixel-font inline-flex items-center rounded-sm uppercase tracking-widest text-[10px]",
        size === "md" ? "px-3 py-1" : "px-2 py-0.5 text-[8px]",
        className,
      )}
      style={{
        backgroundColor: color,
        color: "#132610",
        textShadow: "1px 1px #9dc48c",
      }}
    >
  {typeName.toUpperCase()}
    </span>
  );
}
