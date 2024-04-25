/* eslint-disable camelcase */
import { fetchJson, thrownHasStatus } from '@riddance/fetch'
import type { Environment } from '@riddance/service/context'

export async function getRepos(env: Environment, pathname: string) {
    return [
        ...(await getReposFrom('users', env, pathname)),
        ...(await getReposFrom('orgs', env, pathname)),
    ]
}

export async function getHooks(env: Environment, repo: { hooks_url: string }) {
    return await fetchJson<{ id: number; events: string[]; config: { url: string } }[]>(
        repo.hooks_url,
        {
            headers: headers(env),
        },
        'Error fetching hooks.',
    )
}

export async function createHook(env: Environment, repo: { hooks_url: string }, url: string) {
    await fetchJson<{ ssh_url: string; hooks_url: string; name: string }[]>(
        repo.hooks_url,
        {
            method: 'POST',
            headers: {
                ...headers(env),
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                name: 'web',
                events: ['push'],
                config: {
                    url,
                    content_type: 'json',
                },
            }),
        },
        'Error creating hook.',
    )
}

async function getReposFrom(who: 'orgs' | 'users', env: Environment, pathname: string) {
    try {
        return await fetchJson<{ ssh_url: string; hooks_url: string; name: string }[]>(
            `https://api.github.com/${who}${pathname}repos`,
            {
                headers: headers(env),
            },
            'Error fetching repositories.',
        )
    } catch (e) {
        if (thrownHasStatus(e, 404)) {
            return []
        }
        throw e
    }
}

export async function startBuild(env: Environment, pathname: string, _revision: string) {
    const [org, repo] = pathname.split('/')
    await fetchJson<{ ssh_url: string; hooks_url: string; name: string }[]>(
        `https://api.github.com/repos/${org}/github-builder-workflows/dispatches`,
        {
            method: 'POST',
            headers: {
                ...headers(env),
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'build',
                client_payload: {
                    repo_url: `git@github.com:${org}/${repo}.git`,
                    glue_repo_url: `git@github.com:${org}/glue.staging.json`,
                    deploy_version: '0.0.1',
                    environment: 'staging',
                    region: 'eu-central-1',
                },
            }),
        },
        'Error starting recognition build.',
    )
}

function headers(env: Environment) {
    return {
        'X-GitHub-Api-Version': '2022-11-28',
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${env.GITHUB_ACCESS_TOKEN}`,
        'user-agent': 'riddance-builder/1',
    }
}
