import { COUNTRIES, SIMILAR_FLAGS } from '~/utils/game-data';
import { shuffleArray, getRandomItem } from './random';
import type { Country, Question, Difficulty } from '~/types/game';

export const generateQuestion = (
  targetCountry: Country,
  allCountries: Country[],
  difficulty: Difficulty = 'medium',
  region: string = 'World'
): Question => {
  const distractors: Country[] = [];
  
  // 1. Similarity Traps (Priority)
  // If the target country has defined look-alikes, try to include them.
  // This makes the game "smart" and educational.
  if (targetCountry.code in SIMILAR_FLAGS) {
    // @ts-ignore - SIMILAR_FLAGS has string keys but TS might infer specific keys
    const traps = SIMILAR_FLAGS[targetCountry.code] as string[];
    const shuffledTraps = shuffleArray(traps);

    for (const trapCode of shuffledTraps) {
      const trapCountry = allCountries.find((c) => c.code === trapCode);
      // Only add valid traps that aren't the target itself
      if (trapCountry && trapCountry.code !== targetCountry.code && distractors.length < 3) {
        distractors.push(trapCountry);
      }
    }
  }

  // 2. Filter available distractors based on Region
  let availablePool = allCountries.filter((c) => c.code !== targetCountry.code);
  
  if (region !== 'World') {
    const regionPool = availablePool.filter((c) => c.continent === region);
    // Only strict filter if we have enough candidates
    if (regionPool.length >= 4) {
      availablePool = regionPool;
    }
  }

  // 3. Fill remaining spots with random countries
  // We exclude already picked distractors
  availablePool = availablePool.filter(c => !distractors.includes(c));

  while (distractors.length < 3 && availablePool.length > 0) {
    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const picked = availablePool[randomIndex];
    distractors.push(picked);
    availablePool.splice(randomIndex, 1); // Remove to avoid dupes
  }

  // 4. Create Options Array (Target + 3 Distractors)
  const options = shuffleArray([targetCountry, ...distractors]);

  return {
    correctOption: targetCountry,
    options,
  };
};

