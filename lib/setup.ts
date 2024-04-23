import type { Environment } from '@riddance/service/context'
import { notImplemented } from '@riddance/service/http'
import * as github from './github/setup.js'

export async function setup(env: Environment, hookUrl: string, url: URL) {
    if (!(await github.setup(env, hookUrl, url))) {
        throw notImplemented()
    }
}
