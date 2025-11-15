export const getFilteredOrdersQuery = `
    query GetFilteredOrders($datatokens: [String], $userIds: [String]) {
        orders(
            where: {
                datatoken_in: $datatokens,
                consumer_in: $userIds
            },
            orderBy: createdTimestamp,
            orderDirection: desc,
            first: 1000
        ) {
            datatoken {
                id
            }
            consumer {
                id
            }
            createdTimestamp
        }
    }
`

export type TGetFilteredOrdersQueryResult = {
  orders: Array<{
    datatoken: {
      id: string
    }
    consumer: {
      id: string
    }
    createdTimestamp: number
  }>
}
