import { isGoalSatisfied } from "../core/game-rules";
import type { GameState } from "../core/types";

export function WordProgress({ game }: { game: GameState }) {
  return (
    <div className="word-progress" aria-label={`Từ mục tiêu ${game.word}`}>
      {game.goals.map((goal) => {
        const complete = isGoalSatisfied(goal, game.crates);
        return (
          <div key={goal.id} className={`word-chip ${complete ? "word-chip-complete" : ""}`}>
            <span>{goal.letter}</span>
            <small>{goal.index + 1}</small>
          </div>
        );
      })}
    </div>
  );
}
