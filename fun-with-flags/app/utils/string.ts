export const levenshtein = (a: string, b: string): number => {
    const matrix: number[][] = [];
  
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
  
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          );
        }
      }
    }
  
    return matrix[b.length][a.length];
  };
  
  export const isMatch = (input: string, target: string): boolean => {
    const cleanInput = input.trim().toLowerCase();
    const cleanTarget = target.trim().toLowerCase();
    
    // Exact match
    if (cleanInput === cleanTarget) return true;
    
    // Fuzzy match (allow 1-2 typos depending on length)
    const dist = levenshtein(cleanInput, cleanTarget);
    const allowedErrors = cleanTarget.length <= 4 ? 0 : cleanTarget.length <= 7 ? 1 : 2;
    
    return dist <= allowedErrors;
  }