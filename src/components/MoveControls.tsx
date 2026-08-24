import type { Direction } from "../core/types";

interface MoveControlsProps {
  onMove: (direction: Direction) => void;
  compact?: boolean;
}

export function MoveControls({ onMove, compact = false }: MoveControlsProps) {
  const arrow = (rotation: number) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M12 4 5.5 11h4v7h5v-7h4L12 4Z" />
    </svg>
  );

  return (
    <div className={`dpad ${compact ? "dpad-compact" : ""}`} aria-label="Điều khiển di chuyển">
      <button type="button" className="dpad-up" aria-label="Đi lên" onClick={() => onMove("up")}>
        {arrow(0)}
      </button>
      <button type="button" className="dpad-left" aria-label="Sang trái" onClick={() => onMove("left")}>
        {arrow(-90)}
      </button>
      <div className="dpad-center" aria-hidden="true"><i /></div>
      <button type="button" className="dpad-right" aria-label="Sang phải" onClick={() => onMove("right")}>
        {arrow(90)}
      </button>
      <button type="button" className="dpad-down" aria-label="Đi xuống" onClick={() => onMove("down")}>
        {arrow(180)}
      </button>
    </div>
  );
}
