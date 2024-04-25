import type { Environment } from '@riddance/service/context'
import { startBuild } from './api.js'

export async function processRevision(env: Environment, url: string, revision: string) {
    if (!url.startsWith('git@github.com:')) {
        return false
    }
    await startBuild(env, url.slice(15, -4), revision)
    return true
}
