export const capitalize = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export const formatInstruction = (instruction: string) =>
  instruction.replace(/^Step:\d+\s*/, "");
