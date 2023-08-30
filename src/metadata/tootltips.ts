export const tooltipsText = {
  Asset: `### Predicted asset details containing:

  -**market**: source from where the price it's fetched

  -**timeframe**: time between predictions(5m, 1h etc)

  -**token pair**: composed of main token and base token(BTC/USDT)
  `,
  Price: `**Live price** of the token represented in base token, refreshing every 10s`,
  Next: `Consult the predicted price direction, confidence and staked amount, then open your position right when the timer runs out.`,
  Live: `Do not enter the prediction that's live because valu it's not accurate anymore.

  Check the live price fluctuation between predicted and actual value.
  `,
  History: `Result of the last predictions in order to have some accuracy data.

  If footer color it's the same as prediction color, prediction was accurate.
  `,
  Subscription: `Purchase a subscription in order to have access to the predictions`
}

export const tooltipOptions = {
  Asset: 'Asset',
  Price: 'Price',
  Next: 'Next',
  Live: 'Live',
  History: 'History',
  Subscription: 'Subscription'
}
