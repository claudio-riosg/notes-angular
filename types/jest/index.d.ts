declare const jest: any;

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => any | Promise<any>): void;
declare function beforeEach(fn: () => any | Promise<any>): void;
declare function afterEach(fn: () => any | Promise<any>): void;
declare function beforeAll(fn: () => any | Promise<any>): void;
declare function afterAll(fn: () => any | Promise<any>): void;

declare function expect(actual: any): any;


