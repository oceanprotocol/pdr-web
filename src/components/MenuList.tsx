import styles from '@/styles/MenuList.module.css'

export const MenuList: React.FC = () => (
  <ul className={styles.list}>
    <li>
      <a target="_blank" href="https://github.com/oceanprotocol/pdr-backend/blob/main/READMEs/testnet-faucet.md">Get tokens</a>
    </li>
    <li>
      <a target="_blank" href="https://github.com/oceanprotocol/pdr-backend/">
        Run bots
      </a>
    </li>
    <li>
      <a href="">About</a>
    </li>
  </ul>
)
