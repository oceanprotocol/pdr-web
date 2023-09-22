import styles from '@/styles/MenuList.module.css'

export const MenuList: React.FC = () => (
  <ul className={styles.list}>
    <li>
      <a
        target="_blank"
        href="https://github.com/oceanprotocol/pdr-backend/blob/main/READMEs/testnet-faucet.md"
      >
        Get tokens
      </a>
    </li>
    <li>
      <a target="_blank" href="https://github.com/oceanprotocol/pdr-backend/">
        Run bots
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href="https://blog.oceanprotocol.com/meet-predictoor-accountable-accurate-prediction-feeds-8b104d26a5d9"
      >
        About
      </a>
    </li>
  </ul>
)
