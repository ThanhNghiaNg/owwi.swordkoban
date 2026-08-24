export interface RandomSource {
  next(): number;
  int(minInclusive: number, maxExclusive: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRandom(seed: string): RandomSource {
  let state = hashSeed(seed) || 0x6d2b79f5;

  const next = (): number => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int(minInclusive, maxExclusive) {
      if (maxExclusive <= minInclusive) return minInclusive;
      return minInclusive + Math.floor(next() * (maxExclusive - minInclusive));
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error("Cannot pick from an empty array.");
      return items[this.int(0, items.length)] as T;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = this.int(0, index + 1);
        [result[index], result[swapIndex]] = [result[swapIndex] as T, result[index] as T];
      }
      return result;
    },
  };
}

export function createSeed(): string {
  try {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `${values[0]?.toString(36)}-${values[1]?.toString(36)}`;
  } catch {
    return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`;
  }
}
