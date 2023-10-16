import React from 'react'
import styles from '../styles/ArrowDown.module.css'

export const ArrowUp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    fill-rule="evenodd"
    clip-rule="evenodd"
    viewBox="0 0 24 24"
    className={styles.arrowUp}
    {...props}
  >
    <path d="M11 2.206l-6.235 7.528-.765-.645 7.521-9 7.479 9-.764.646-6.236-7.53v21.884h-1v-21.883z" />
  </svg>
)
