import type { CSSProperties } from "react";
import { gameBackground, portalFrames } from "./assets/gameAssets";
import { GameActions } from "./components/GameActions";
import { GameBoard } from "./components/GameBoard";
import { GeneratorPanel } from "./components/GeneratorPanel";
import { HintPanel } from "./components/HintPanel";
import { MoveControls } from "./components/MoveControls";
import { WinOverlay } from "./components/WinOverlay";
import { WordProgress } from "./components/WordProgress";
import { useOrderedSokoban } from "./hooks/useOrderedSokoban";

export default function App() {
  const sokoban = useOrderedSokoban();
  return (
    <div
      className="app-shell"
      style={{ "--game-background": `url("${gameBackground}")` } as CSSProperties}
    >
      <a className="skip-link" href="#game-content">Bỏ qua phần tiêu đề</a>
      <div className="sky-haze" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-lockup">
          <img src={portalFrames[3]} alt="" draggable={false} />
          <div>
            <p className="brand-kicker">Khu vườn chữ</p>
            <h1>Ordered <span>Sokoban</span></h1>
          </div>
        </div>
        <div className="header-rule">
          <span>Đã về đúng cổng</span>
          <strong>{sokoban.matchedGoals}<small>/ {sokoban.game.goals.length}</small></strong>
        </div>
      </header>

      <main className="game-layout" id="game-content">
        <section className="play-column">
          <div className="quest-card">
            <div className="quest-copy">
              <p className="eyebrow">Nhiệm vụ hiện tại</p>
              <h2>Đưa từng thùng về đúng cổng chữ</h2>
              <WordProgress game={sokoban.game} />
            </div>
            <div className="quest-progress" aria-label={`Tiến độ ${Math.round(sokoban.progress * 100)}%`}>
              <span>{Math.round(sokoban.progress * 100)}%</span>
              <div><i style={{ width: `${sokoban.progress * 100}%` }} /></div>
            </div>
          </div>

          <div className="board-stage">
            <GameBoard
              game={sokoban.game}
              playerDirection={sokoban.playerDirection}
              onMove={sokoban.move}
            />
            {sokoban.game.lastMessage && (
              <div className="toast-message" role="status">{sokoban.game.lastMessage}</div>
            )}
          </div>

          <div className="mobile-controls">
            <p>Vuốt trên bàn cờ hoặc dùng phím điều hướng</p>
            <MoveControls onMove={sokoban.move} />
          </div>
        </section>

        <aside className="side-column">
          <GameActions
            moves={sokoban.game.moves}
            pushes={sokoban.game.pushes}
            canUndo={sokoban.historyLength > 0}
            onUndo={sokoban.undo}
            onReset={sokoban.reset}
            onNewMap={() => sokoban.generate({ seed: "" })}
          />

          <HintPanel hint={sokoban.hint} onHint={sokoban.requestHint} />

          <section className="panel-card desktop-dpad-card">
            <div>
              <p className="eyebrow">Điều khiển</p>
              <h2>Di chuyển</h2>
              <p className="muted">Dùng WASD, phím mũi tên hoặc vuốt trên bàn cờ.</p>
            </div>
            <MoveControls compact onMove={sokoban.move} />
          </section>

          <GeneratorPanel
            config={sokoban.config}
            activeSeed={sokoban.level.seed}
            usedFallback={sokoban.usedFallback}
            onGenerate={sokoban.generate}
          />

          <section className="panel-card rules-card">
            <p className="eyebrow">Luật khu vườn</p>
            <p>
              Thùng luôn có thể được đẩy ra khỏi cổng. Bạn chiến thắng khi mọi cổng đều giữ đúng chữ và hàng cổng ghép thành từ mục tiêu.
            </p>
          </section>
        </aside>
      </main>

      {sokoban.game.status === "won" && (
        <WinOverlay
          word={sokoban.game.word}
          moves={sokoban.game.moves}
          pushes={sokoban.game.pushes}
          onNext={() => sokoban.generate({ seed: "" })}
          onReplay={sokoban.reset}
        />
      )}
    </div>
  );
}
