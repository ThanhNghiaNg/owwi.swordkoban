import { useRef, type CSSProperties, type PointerEvent } from "react";
import {
  crateSprite,
  floorSprite,
  heroSprite,
  obstacleSprite,
  portalFrames,
  solvedEffect,
  wallSprite,
} from "../assets/gameAssets";
import { crateAt, goalAt, objectAt } from "../core/board";
import { isGoalSatisfied } from "../core/game-rules";
import type { Direction, GameState, Position } from "../core/types";

interface GameBoardProps {
  game: GameState;
  playerDirection: Direction;
  onMove: (direction: Direction) => void;
}

interface CellProps {
  game: GameState;
  position: Position;
  currentGoalIndex?: number;
}

function Cell({ game, position, currentGoalIndex }: CellProps) {
  const object = objectAt(game.objects, position);
  const goal = goalAt(game.goals, position);
  const crate = crateAt(game.crates, position);
  const completedGoal = goal !== undefined && isGoalSatisfied(goal, game.crates);
  const boxImage = crate ? crateSprite(crate.letter) : undefined;
  const depth = position.row * 10;

  return (
    <div className="board-cell" role="gridcell" aria-label={`Hàng ${position.row + 1}, cột ${position.col + 1}`}>
      <img
        className="floor-image"
        src={floorSprite(game.levelId, position.row, position.col)}
        alt=""
        draggable={false}
      />

      {goal && !object && (
        <div
          className={`goal-layer ${completedGoal ? "goal-complete" : ""} ${currentGoalIndex === goal.index ? "goal-current" : ""}`}
          aria-label={`Cổng ${goal.index + 1}: chữ ${goal.letter}`}
        >
          <div className="portal-animation" aria-hidden="true">
            {portalFrames.map((frame, index) => (
              <img
                key={frame}
                src={frame}
                alt=""
                draggable={false}
                style={{ "--portal-frame": index } as CSSProperties}
              />
            ))}
          </div>
          <span className="goal-letter">{goal.letter}</span>
          <span className="goal-order">{goal.index + 1}</span>
        </div>
      )}

      {object?.kind === "wall" && (
        <img
          className="tile-image wall-image"
          src={wallSprite(game.levelId, position.row, position.col)}
          alt="Tường đá"
          draggable={false}
          style={{ zIndex: depth + 4 }}
        />
      )}

      {object?.kind === "obstacle" && (
        <img
          className="tile-image obstacle-image"
          src={obstacleSprite(game.levelId, object.id)}
          alt="Chướng ngại vật"
          draggable={false}
          style={{ zIndex: depth + 5 }}
        />
      )}

      {crate && (
        <div
          className={`crate-layer ${completedGoal ? "crate-complete" : ""}`}
          style={{ zIndex: depth + 7 }}
        >
          {boxImage ? (
            <img src={boxImage} alt={`Thùng chữ ${crate.letter}`} draggable={false} />
          ) : (
            <div className="crate-fallback" aria-label={`Thùng chữ ${crate.letter}`}>{crate.letter}</div>
          )}
          {completedGoal && <img className="solved-effect" src={solvedEffect} alt="" draggable={false} />}
        </div>
      )}
    </div>
  );
}

export function GameBoard({ game, playerDirection, onMove }: GameBoardProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const cells = [];
  const currentGoalIndex = game.goals.find((goal) => !isGoalSatisfied(goal, game.crates))?.index;

  for (let row = 0; row < game.rows; row += 1) {
    for (let col = 0; col < game.cols; col += 1) {
      cells.push(
        <Cell
          key={`${row}:${col}`}
          game={game}
          position={{ row, col }}
          currentGoalIndex={currentGoalIndex}
        />,
      );
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      onMove(deltaX > 0 ? "right" : "left");
    } else {
      onMove(deltaY > 0 ? "down" : "up");
    }
  };

  const boardRatio = game.cols / game.rows;
  const boardStyle = {
    "--board-cols": game.cols,
    "--board-rows": game.rows,
    "--board-ratio": `${game.cols} / ${game.rows}`,
    // Keep the cells square when the board is height-constrained on desktop.
    // Expanding (ratio * (100dvh - 225px)) avoids the distortion caused by
    // combining width: 100% with max-height on the grid itself.
    "--board-fit-width": `clamp(280px, calc(${boardRatio * 100}dvh - ${boardRatio * 225}px), 1200px)`,
    "--player-col": game.player.col,
    "--player-row": game.player.row,
  } as CSSProperties;

  return (
    <div className="board-shell" style={boardStyle}>
      <div className="board-corner board-corner-left" aria-hidden="true" />
      <div className="board-corner board-corner-right" aria-hidden="true" />
      <div
        className="game-board"
        role="grid"
        aria-label={`Bàn chơi ${game.rows} hàng, ${game.cols} cột. Vuốt để di chuyển.`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
      >
        {cells}
        <div
          className="player-layer"
          aria-label="Nhân vật"
          style={{ zIndex: game.player.row * 10 + 8 }}
        >
          <img src={heroSprite(playerDirection, game.moves)} alt="Nhân vật" draggable={false} />
        </div>
      </div>
    </div>
  );
}
