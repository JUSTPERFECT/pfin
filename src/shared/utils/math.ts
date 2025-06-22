export const roundTo = (number: number, decimals: number = 2): number => {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };
  
  export const percentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return roundTo((value / total) * 100);
  };
  
  export const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return roundTo(((current - previous) / previous) * 100);
  };
  
  export const sum = (numbers: number[]): number => {
    return numbers.reduce((total, num) => total + num, 0);
  };
  
  export const average = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return roundTo(sum(numbers) / numbers.length);
  };
  
  export const median = (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return average([sorted[middle - 1], sorted[middle]]);
    }
    
    return sorted[middle];
  };
  
  export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };
  
  export const randomBetween = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };