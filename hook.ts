import { badRequest, objectSpreadable, post } from '@riddance/service/http'
import { repoChanged } from './lib/events.js'

post('webhook', async (context, request) => {
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
})
