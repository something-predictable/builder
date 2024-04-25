import type { Environment } from '@riddance/service/context'
import { notImplemented } from '@riddance/service/http'
import * as github from './github/dispatch.js'

export async function repoChanged(
    env: Environment,
    url: string,
    _ref: string,
    _before: string,
    after: string,
) {
    if (!(await github.processRevision(env, url, after))) {
        throw notImplemented()
    }
}
