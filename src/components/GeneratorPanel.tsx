import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { WORD_PRESETS } from "../data/words";
import { sanitizeWord } from "../core/generator";
import type { GeneratorConfig } from "../core/types";
import { gameButtons } from "../assets/gameAssets";

interface GeneratorPanelProps {
  config: GeneratorConfig;
  activeSeed: string;
  usedFallback: boolean;
  onGenerate: (config: Partial<GeneratorConfig>) => void;
}

export function GeneratorPanel({ config, activeSeed, usedFallback, onGenerate }: GeneratorPanelProps) {
  const [draft, setDraft] = useState(config);

  useEffect(() => setDraft(config), [config]);

  const update = <K extends keyof GeneratorConfig>(key: K, value: GeneratorConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const normalizedWord = sanitizeWord(draft.word) || "SWORD";
  const minimumCols = normalizedWord.length + 4;

  return (
    <details className="panel-card generator-card">
      <summary className="generator-summary">
        <img src={gameButtons.settings} alt="" />
        <div>
          <p className="eyebrow">Tùy chỉnh thử thách</p>
          <h2>Tạo bản đồ</h2>
        </div>
        <span className="status-pill">Đã kiểm tra</span>
      </summary>

      <div className="generator-body">
      <div className="form-grid">
        <label>
          <span>Từ mục tiêu</span>
          <input
            value={draft.word}
            maxLength={8}
            onChange={(event: ChangeEvent<HTMLInputElement>) => update("word", event.target.value)}
            onBlur={() => update("word", normalizedWord)}
            placeholder="SWORD"
            autoCapitalize="characters"
          />
        </label>

        <label>
          <span>Từ gợi ý</span>
          <select value="" onChange={(event: ChangeEvent<HTMLSelectElement>) => event.target.value && update("word", event.target.value)}>
            <option value="">Chọn từ…</option>
            {WORD_PRESETS.map((word) => <option key={word} value={word}>{word}</option>)}
          </select>
        </label>

        <label>
          <span>Số hàng</span>
          <input
            type="number"
            min={7}
            max={13}
            value={draft.rows}
            onChange={(event: ChangeEvent<HTMLInputElement>) => update("rows", Number(event.target.value))}
          />
        </label>

        <label>
          <span>Số cột</span>
          <input
            type="number"
            min={minimumCols}
            max={15}
            value={Math.max(draft.cols, minimumCols)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => update("cols", Number(event.target.value))}
          />
        </label>

        <label className="span-2">
          <span>Mật độ chướng ngại · {Math.round(draft.obstacleDensity * 100)}%</span>
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.01}
            value={draft.obstacleDensity}
            onChange={(event: ChangeEvent<HTMLInputElement>) => update("obstacleDensity", Number(event.target.value))}
          />
        </label>

        <label className="span-2">
          <span>Seed <em>để trống = seed ngẫu nhiên</em></span>
          <input
            value={draft.seed}
            onChange={(event: ChangeEvent<HTMLInputElement>) => update("seed", event.target.value)}
            placeholder="random"
            spellCheck={false}
          />
        </label>
      </div>

      <div className="generator-actions">
        <button
          type="button"
          className="primary-button wide"
          onClick={() => onGenerate({ ...draft, word: normalizedWord, cols: Math.max(draft.cols, minimumCols) })}
        >
          Tạo bản đồ có lời giải
        </button>
        <button type="button" className="ghost-button" onClick={() => onGenerate({ ...draft, seed: activeSeed })}>
          Chơi lại seed
        </button>
      </div>

      <p className="microcopy break-anywhere">
        Seed hiện tại: <code>{activeSeed}</code>{usedFallback ? " · đang dùng bố cục dự phòng an toàn" : ""}
      </p>
      </div>
    </details>
  );
}
