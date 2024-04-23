import { badRequest, objectSpreadable, post } from '@riddance/service/http'
import { setup } from './lib/setup.js'

post('setup', async (context, request) => {
    const { url } = objectSpreadable(request.body)
    if (typeof url !== 'string') {
        throw badRequest()
    }
    await setup(context.env, `https://${request.headers.host}/webhook`, new URL(url))
})
