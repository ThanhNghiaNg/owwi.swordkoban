import { winEffect } from "../assets/gameAssets";

interface WinOverlayProps {
  word: string;
  moves: number;
  pushes: number;
  onNext: () => void;
  onReplay: () => void;
}

export function WinOverlay({ word, moves, pushes, onNext, onReplay }: WinOverlayProps) {
  return (
    <div className="win-overlay" role="dialog" aria-modal="true" aria-label="Hoàn thành màn chơi">
      <div className="win-card">
        <img className="win-glyph" src={winEffect} alt="" draggable={false} />
        <p className="eyebrow">Khu vườn bừng sáng</p>
        <h2>{word}</h2>
        <p>Hoàn thành với {moves} bước đi và {pushes} lần đẩy.</p>
        <div className="win-actions">
          <button type="button" className="primary-button" onClick={onNext}>Chơi màn mới</button>
          <button type="button" className="ghost-button" onClick={onReplay}>Chơi lại</button>
        </div>
      </div>
    </div>
  );
}
