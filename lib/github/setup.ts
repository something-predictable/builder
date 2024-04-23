import type { Environment } from '@riddance/service/context'
import { notImplemented } from '@riddance/service/http'
import { createHook, getHooks, getRepos } from './api.js'

export async function setup(env: Environment, hookUrl: string, url: URL) {
    if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
        return false
    }
    const repos = allowed(env, await getRepos(env, url.pathname))
    for (const repo of repos) {
        await syncHooks(env, hookUrl, repo)
    }
    return true
}

async function syncHooks(
    env: Environment,
    hookUrl: string,
    repo: { ssh_url: string; hooks_url: string },
) {
    const hooks = await getHooks(env, repo)
    if (hooks.find(h => h.config.url === hookUrl)) {
        return
    }
    if (hooks.length === 0) {
        try {
            await createHook(env, repo, hookUrl)
        } catch (e) {
            throw Object.assign(e as object, {
                hookUrl,
                repo: repo.ssh_url,
                hooks,
            })
        }
    } else {
        throw Object.assign(notImplemented(), {
            hookUrl,
            repo: repo.ssh_url,
            hooks,
        })
    }
}

function allowed<T extends { name: string; ssh_url: string }>(env: Environment, repos: T[]) {
    const allowedRepos = env.ALLOW_REPOS?.split(',')
    if (!allowedRepos) {
        return repos
    }
    return repos.filter(r => r.name === 'glue' || allowedRepos.includes(r.ssh_url))
}
