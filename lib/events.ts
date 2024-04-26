import type { Environment } from '@riddance/service/context'
import { badRequest, notImplemented } from '@riddance/service/http'
import * as github from './github/dispatch.js'

export async function repoChanged(
    env: Environment,
    url: string,
    ref: string,
    _before: string,
    after: string,
) {
    const branch = ref.split('/').at(-1)
    if (!branch || !ref.startsWith('refs/heads/')) {
        throw badRequest('Strange reference')
    }
    if (!(await github.processRevision(env, url, branch, after))) {
        throw notImplemented()
    }
}
