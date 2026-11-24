import { Directory, File, Paths } from "expo-file-system";

/**
 * A small JSON object persisted in the documents directory. Access is synchronous: the stored values
 * are needed before the first render. A missing or corrupt file reads as {}.
 */
export const jsonStore = <T extends object>(fileName: string) => {
  const file = () => new File(new Directory(Paths.document), fileName);

  const read = (): Partial<T> => {
    try {
      const f = file();
      if (!f.exists) return {};
      const parsed: unknown = JSON.parse(f.textSync());
      return parsed && typeof parsed === "object" ? (parsed as Partial<T>) : {};
    } catch {
      return {};
    }
  };

  const write = (value: T) => {
    try {
      const f = file();
      if (!f.exists) f.create({ intermediates: true });
      f.writeSync(JSON.stringify(value));
    } catch (error) {
      console.warn("could not persist", fileName, error);
    }
  };

  return { read, write };
};
