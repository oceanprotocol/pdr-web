import { currentConfig } from './appconstants'

export type GraphQLResponse<T = any> = {
  data?: T
  errors?: Array<{
    message: string
  }>
}

class GraphqlClient {
  private readonly endpoint: string
  private readonly headers: { [name: string]: string }

  constructor(endpoint: string, headers: { [name: string]: string } = {}) {
    this.endpoint = endpoint
    this.headers = headers
  }

  async query<T = any>(
    query: string,
    variables: { [name: string]: any } = {},
    endpoint?: string
  ): Promise<GraphQLResponse<T>> {
    const response = await fetch(endpoint ? endpoint : this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error(`Network error, received status code ${response.status}`)
    }

    return await response.json()
  }
}

//const client = new GraphqlClient('https://my.graphql.api/endpoint', { 'Authorization': 'Bearer your_token' });
const graphqlClientInstance = new GraphqlClient(currentConfig.subgraph)

export { graphqlClientInstance, GraphqlClient }
