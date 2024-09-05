declare module '*.css' {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

declare namespace Intl {
  interface NumberFormat {
    format(value: number | bigint | string): string; // Add string support, we tested on 2024-07, works on most browser
  }
}
