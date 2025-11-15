import { currentConfig } from './appconstants'

export type GraphQLResponse<T = Record<string, unknown>> = {
  data?: T
  errors?: Array<{
    message: string
  }>
}

type GraphQLVariables = Record<string, unknown>

class GraphqlClient {
  private readonly endpoint: string
  private readonly headers: Record<string, string>

  constructor(endpoint: string, headers: Record<string, string> = {}) {
    this.endpoint = endpoint
    this.headers = headers
  }

  async query<T = Record<string, unknown>>(
    query: string,
    variables: GraphQLVariables = {},
    endpoint?: string
  ): Promise<GraphQLResponse<T>> {
    try {
      const response = await fetch(endpoint ? endpoint : this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify({ query, variables })
      })
      if (!response.ok) {
        throw new Error(
          `Network error, received status code ${response.status}`
        )
      }

      return await response.json()
    } catch (error: unknown) {
      console.error(error)
      return { data: undefined }
    }
  }
}

//const client = new GraphqlClient('https://my.graphql.api/endpoint', { 'Authorization': 'Bearer your_token' });
const graphqlClientInstance = new GraphqlClient(currentConfig.subgraph)

export { GraphqlClient, graphqlClientInstance }
