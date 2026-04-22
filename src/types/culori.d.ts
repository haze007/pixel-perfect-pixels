declare module "culori" {
  export function converter(space: string): (color: any) => any;
  export function formatHex(color: any): string | undefined;
}
