export const predictoorABI = [
  {
    constant: true,
    inputs: [],
    name: 'epoch',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      {
        name: 'blockNum',
        type: 'uint256'
      }
    ],
    name: 'get_agg_predval',
    outputs: [
      {
        name: 'predvalNumer',
        type: 'int256'
      },
      {
        name: 'predvalDenom',
        type: 'int256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
]
