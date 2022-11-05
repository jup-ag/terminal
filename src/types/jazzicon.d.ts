declare module 'jazzicon' {
  // const jazzicon: (width: string | number, address: number) => Node
  // export = jazzicon

  declare class Jazzicon {
    constructor(width: string | number, address: number): Node;
  }
  export default Jazzicon;
}
