import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Price(props: {
  config: any
}) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: props.config.cg_id,
          vs_currencies: props.config.cg_vs_currencies,
        },
      });

      const price = response.data[props.config.cg_id.toLowerCase()][props.config.cg_vs_currencies.toLowerCase()];

      setPrice(price);
    };

    fetchPrice();
  }, [props.config]);

  if (!price) {
    return <div>Loading...</div>;
  }

  return <div>${price}</div>;
};
