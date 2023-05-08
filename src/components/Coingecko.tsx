import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Coingecko(props: {
  config: any
}) {
  const [logo, setLogo] = useState(null);
  const [price, setPrice] = useState(null);
  const [mcap, setMcap] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("props.config", props.config)

      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          ids: props.config.cg_id,
          vs_currency: props.config.cg_vs_currencies,
        },
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });

      console.log("response.data", response.data)

      const logo = response.data[0].image;
      const price = response.data[0].current_price;
      const mcap = response.data[0].market_cap;
      
      setLogo(logo);
      setPrice(price);
      setMcap(mcap);
    };

    fetchData();
  }, [props.config]);

  if (!price || !logo || !mcap ) {
    return <div>Loading...</div>
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
      <img style={{ width: '32px'}} src={logo} /><br/>
      Price ${price}<br/>
      MCAP ${mcap}<br/>
    </div>
  )
}
