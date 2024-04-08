import { dev } from "./config";

export function logJSON(...params: Iterable<any>[]) {
    if (!dev) return
    params.forEach(item => console.log(JSON.stringify(item, undefined, 3)))
}