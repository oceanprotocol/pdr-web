import { GraphQLResponse, graphqlClientInstance } from '../graphqlClient'
import {
  TGetFilteredOrdersQueryResult,
  getFilteredOrdersQuery
} from './queries/getFilteredOrdersQuery'

export const getFilteredOrders = async (
  datatokenId: string,
  userId: string
): Promise<GraphQLResponse<TGetFilteredOrdersQueryResult>> => {
  return graphqlClientInstance.query<TGetFilteredOrdersQueryResult>(
    getFilteredOrdersQuery,
    {
      datatokens: [datatokenId.toLowerCase()],
      userIds: [userId.toLowerCase()]
    }
  )
}
