export default (str: string): string[] =>
  String(str)
    .split(/[.[\]]+/)
    .filter(Boolean);
