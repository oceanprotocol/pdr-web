import styles from '@/styles/MenuList.module.css'

export const MenuList: React.FC = () => (
  <ul className={styles.list}>
    <li>
      <a target="_blank" href="https://github.com/oceanprotocol/pdr-backend/">
        py SDK
      </a>
    </li>
    <li>
      <a href="">About</a>
    </li>
  </ul>
)
