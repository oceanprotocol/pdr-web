export const tooltipsText = {
  asset: `### Predicted asset details containing:

  -**timeframe**: time between predictions(5m, 1h).

  -**token pair**: composed of main token and base token(BTC, TUSD).

  -**market**: source from where the price it's fetched.
  `,
  live: `Live price and direction compared to previous prediction time price.
  
  Price is refreshed every 10 seconds.
  `,
  history: `Price at the specified time with direction compared to previous prediction time price.

  If subscribed, the prediction data it's going to be displayed.
  `,
  prediction: `Predicted price direction for the time specified time.
  
  Check OCEAN staked and stake directions for a higher confidence.
  `,
  accuracy: `Percentage of accurate predicitons over the last 24 hours.`,
  subscription: `Purchase a subscription in order to have access to price direction predictions.`
}

export const tooltipOptions = {
  asset: 'Asset',
  prediction: 'prediction',
  live: 'Live',
  history: 'History',
  accuracy: 'Accuracy',
  subscription: 'Subscription'
}
