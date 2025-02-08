declare module "pangu" {
  interface PanguStatic {
    spacing: (text: string) => string;
    spacingFile: (path: string) => Promise<void>;
    spacingFileSync: (path: string) => void;
    spacingPage: (tag?: string) => void;
    spacingElementById: (id: string) => void;
    spacingElementByClassName: (className: string) => void;
    spacingElementByTagName: (tagName: string) => void;
  }

  const pangu: PanguStatic;
  export default pangu;
}
