declare module "@babel/standalone" {
    export function transform(code: string, options: unknown): { code: string | null }
}
