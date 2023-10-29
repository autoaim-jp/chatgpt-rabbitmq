const mod = {}
const store = {}

const init = async ({ setting, lib, amqpConnection, OpenAI }) => {
  const amqpPromptChannel = await amqpConnection.createChannel()
  mod.amqpPromptChannel = amqpPromptChannel
  const amqpResponseChannel = await amqpConnection.createChannel()
  mod.amqpResponseChannel = amqpResponseChannel

  const { OPENAPI_CHATGPT_API_KEY } = mod.setting.getValue('env.OPENAPI_CHATGPT_API_KEY')
  const openaiClient = new OpenAI({
    apiKey: OPENAPI_CHATGPT_API_KEY
  })

  mod.openaiClient = openaiClient

  mod.setting = setting
  mod.lib = lib
}

const _fetchChatgpt = async ({ role, prompt }) => {
  const requestObj = {
    {
      messages: [{ role, content: prompt }],
        model: 'gpt-3.5-turbo',
    },
    { maxRetries: 5 },
  }
  const responseObj = await openai.chat.completions.create(requestObj)

  return responseObj
}


const startConsumer = async () => {
  const promptQueue = mod.setting.getValue('amqp.CHATGPT_PROMPT_QUEUE') 
  await mod.amqpPromptChannel.assertQueue(promptQueue)

  const responseQueue = mod.setting.getValue('amqp.CHATGPT_RESPONSE_QUEUE') 
  await mod.amqpResponseChannel.assertQueue(responseQueue)

  mod.amqpPromptChannel.consume(promptQueue, async (msg) => {
    if (msg !== null) {
      console.log('Recieved:', msg.content.toString())
      const SLEEP_BEFORE_REQUEST_MS = a.setting.getValue('chatgpt.SLEEP_BEFORE_REQUEST_MS')
      console.log(`sleep ${SLEEP_BEFORE_REQUEST_MS}s`)
      await mod.lib.awaitSleep({ ms: SLEEP_BEFORE_REQUEST_MS })

      const requestJson = JSON.parse(msg.content.toString())

      const role = requestJson.role || mod.setting.getValue('chatgpt.DEFAULT_ROLE')
      const prompt = requestJson.prompt || mod.setting.getValue('chatgpt.DEFAULT_ROLE')

      const responseObj = await _fetchChatgpt({ role, prompt })
      console.log('chatgpt response:')
      console.log(responseObj)
      mod.amqpResponseChannel.sendToQueue(responseQueue, Buffer.from(JSON.stringify(responseObj)))

      mod.amqpPromptChannel.ack(msg)
    } else {
      console.log('Consumer cancelled by server')
      throw new Error()
    }
  })
}

export default {
  init,
  startConsumer,
}

