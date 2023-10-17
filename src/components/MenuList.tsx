import styles from '@/styles/MenuList.module.css'
import { DarkModeSwitch } from './DarkModeSwitch'

export const MenuList: React.FC = () => (
  <ul className={styles.list}>
    <li>
      <a
        target="_blank"
        href="https://github.com/oceanprotocol/pdr-backend/blob/main/READMEs/get-tokens.md"
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
      <a target="_blank" href="https://docs.oceanprotocol.com/predictoor">
        About
      </a>
    </li>
    <li>
      <a
        target="_blank"
        href={
          process.env.NEXT_PUBLIC_ENV === 'staging'
            ? 'https://predictoor.ai'
            : 'https://test.predictoor.ai'
        }
      >
        {`Go to ${
          process.env.NEXT_PUBLIC_ENV === 'staging' ? 'Mainnet' : 'Testnet'
        }`}
      </a>
    </li>
    <li>
      <DarkModeSwitch />
    </li>
  </ul>
)
