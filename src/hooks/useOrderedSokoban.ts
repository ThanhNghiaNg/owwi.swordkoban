import { useCallback, useEffect, useMemo, useState } from "react";
import { KEY_TO_DIRECTION } from "../core/directions";
import { generateLevel, normalizeGeneratorConfig } from "../core/generator";
import { countSatisfiedGoals, createGameState, tryMove } from "../core/game-rules";
import { solveGame } from "../core/solver";
import type { Direction, GameState, GeneratorConfig, LevelDefinition } from "../core/types";

export interface HintState {
  directions: Direction[];
  exploredNodes: number;
  error?: string;
}

export function useOrderedSokoban(initialConfig: Partial<GeneratorConfig> = {}) {
  const [config, setConfig] = useState<GeneratorConfig>(() => normalizeGeneratorConfig(initialConfig));
  const initialGenerated = useMemo(() => generateLevel(config), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [level, setLevel] = useState<LevelDefinition>(initialGenerated.level);
  const [game, setGame] = useState<GameState>(() => createGameState(initialGenerated.level));
  const [history, setHistory] = useState<GameState[]>([]);
  const [hint, setHint] = useState<HintState>({ directions: [], exploredNodes: 0 });
  const [usedFallback, setUsedFallback] = useState(initialGenerated.usedFallback);
  const [playerDirection, setPlayerDirection] = useState<Direction>("down");

  const clearHint = useCallback(() => {
    setHint({ directions: [], exploredNodes: 0 });
  }, []);

  const move = useCallback((direction: Direction) => {
    setPlayerDirection(direction);
    setGame((current) => {
      const result = tryMove(current, direction);
      if (!result.moved) return result.state;

      setHistory((items) => [...items, current]);
      setHint((currentHint) => {
        if (currentHint.directions[0] === direction) {
          return { ...currentHint, directions: currentHint.directions.slice(1) };
        }
        return { directions: [], exploredNodes: 0 };
      });
      return result.state;
    });
  }, []);

  const generate = useCallback(
    (overrides: Partial<GeneratorConfig> = {}) => {
      const nextConfig = normalizeGeneratorConfig({ ...config, ...overrides });
      const generated = generateLevel(nextConfig);
      setConfig(nextConfig);
      setLevel(generated.level);
      setGame(createGameState(generated.level));
      setHistory([]);
      clearHint();
      setUsedFallback(generated.usedFallback);
      setPlayerDirection("down");
    },
    [clearHint, config],
  );

  const reset = useCallback(() => {
    setGame(createGameState(level));
    setHistory([]);
    clearHint();
    setPlayerDirection("down");
  }, [clearHint, level]);

  const undo = useCallback(() => {
    setHistory((items) => {
      const previous = items.at(-1);
      if (!previous) return items;
      setGame(previous);
      clearHint();
      return items.slice(0, -1);
    });
  }, [clearHint]);

  const requestHint = useCallback(() => {
    const result = solveGame(game, config.solverNodeLimit);
    if (!result.solved) {
      setHint({
        directions: [],
        exploredNodes: result.exploredNodes,
        error:
          result.reason === "node-limit"
            ? "Trình gợi ý đã chạm giới hạn tìm kiếm."
            : "Không tìm thấy lời giải từ vị trí hiện tại. Hãy hoàn tác hoặc chơi lại.",
      });
      return;
    }

    setHint({ directions: result.directions.slice(0, 5), exploredNodes: result.exploredNodes });
  }, [config.solverNodeLimit, game]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button")) return;

      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
        return;
      }

      if (event.key.toLowerCase() === "r") reset();
      if (event.key.toLowerCase() === "z") undo();
      if (event.key.toLowerCase() === "h") requestHint();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move, requestHint, reset, undo]);

  const matchedGoals = countSatisfiedGoals(game.crates, game.goals);
  const progress = game.goals.length === 0 ? 1 : matchedGoals / game.goals.length;

  return {
    config,
    level,
    game,
    historyLength: history.length,
    hint,
    matchedGoals,
    progress,
    usedFallback,
    playerDirection,
    move,
    generate,
    reset,
    undo,
    requestHint,
  };
}
