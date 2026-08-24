import { gameButtons } from "../assets/gameAssets";

interface GameActionsProps {
  moves: number;
  pushes: number;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onNewMap: () => void;
}

export function GameActions({ moves, pushes, canUndo, onUndo, onReset, onNewMap }: GameActionsProps) {
  return (
    <section className="panel-card actions-card">
      <div className="panel-title">
        <div>
          <p className="eyebrow">Hành trình</p>
          <h2>Cuộc phiêu lưu</h2>
        </div>
      </div>
      <div className="stat-row">
        <div><small>Bước đi</small><strong>{moves}</strong></div>
        <div><small>Lần đẩy</small><strong>{pushes}</strong></div>
      </div>
      <div className="action-grid">
        <button type="button" className="sprite-button" onClick={onUndo} disabled={!canUndo}>
          <img src={gameButtons.undo} alt="" /><span>Hoàn tác <kbd>Z</kbd></span>
        </button>
        <button type="button" className="sprite-button" onClick={onReset}>
          <img src={gameButtons.reset} alt="" /><span>Chơi lại <kbd>R</kbd></span>
        </button>
        <button type="button" className="adventure-button span-2" onClick={onNewMap}>
          <img src={gameButtons.play} alt="" /><span>Bản đồ ngẫu nhiên mới</span>
        </button>
      </div>
    </section>
  );
}
