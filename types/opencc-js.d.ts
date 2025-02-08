declare module "opencc-js" {
  interface ConverterOptions {
    from?: "cn" | "tw" | "twp" | "hk" | "jp" | "t";
    to?: "cn" | "tw" | "twp" | "hk" | "jp" | "t";
  }

  interface OpenCC {
    Converter: (options: ConverterOptions) => (text: string) => string;
  }

  const OpenCC: OpenCC;
  export = OpenCC;
}
