import { badRequest, notImplemented, objectSpreadable, post } from '@riddance/service/http'
import { repoChanged } from './lib/events.js'

post('webhook', async (context, request) => {
    const event = request.headers['x-github-event']
    if (event === 'ping') {
        //
    } else if (event === 'push') {
        const { ref, before, after, repository } = objectSpreadable(request.body)
        const { ssh_url: sshUrl } = objectSpreadable(repository)
        if (
            typeof ref !== 'string' ||
            typeof before !== 'string' ||
            typeof after !== 'string' ||
            typeof sshUrl !== 'string'
        ) {
            throw badRequest()
        }
        await repoChanged(context.env, sshUrl, ref, before, after)
    } else {
        throw notImplemented()
    }
})
