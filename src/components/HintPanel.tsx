import { DIRECTION_ARROWS } from "../core/directions";
import type { HintState } from "../hooks/useOrderedSokoban";
import { gameButtons } from "../assets/gameAssets";

interface HintPanelProps {
  hint: HintState;
  onHint: () => void;
}

export function HintPanel({ hint, onHint }: HintPanelProps) {
  return (
    <section className="panel-card hint-card">
      <div className="panel-heading-row">
        <div>
          <p className="eyebrow">Lời mách của tiên rừng</p>
          <h2>5 bước tiếp theo</h2>
        </div>
        <button className="hint-button" type="button" onClick={onHint}>
          <img src={gameButtons.hint} alt="" />
          <span>Gợi ý</span>
        </button>
      </div>

      <div className="hint-steps" aria-live="polite">
        {hint.directions.length > 0 ? (
          hint.directions.map((direction, index) => (
            <div key={`${direction}-${index}`} className="hint-step">
              <small>{index + 1}</small>
              <strong>{DIRECTION_ARROWS[direction]}</strong>
            </div>
          ))
        ) : (
          <p className="muted">Bấm Gợi ý hoặc phím H để xem đường đi thông minh nhất.</p>
        )}
      </div>

      {hint.error && <p className="error-text">{hint.error}</p>}
      {hint.exploredNodes > 0 && <p className="microcopy">Đã xét {hint.exploredNodes.toLocaleString()} trạng thái đẩy thùng.</p>}
    </section>
  );
}
