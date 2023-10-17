import React from 'react'
import styles from '../styles/ArrowDown.module.css'

export const ArrowDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    fill-rule="evenodd"
    clip-rule="evenodd"
    viewBox="0 0 24 24"
    className={styles.arrowDown}
    {...props}
  >
    <path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z" />
  </svg>
)
