export interface DocumentFinder {
  findById(id: string): Promise<object | null>;
}
