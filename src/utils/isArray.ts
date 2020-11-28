export default (value: unknown): value is any[] => Array.isArray(value);
