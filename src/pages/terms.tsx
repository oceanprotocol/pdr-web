import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import 'react-notifications/lib/notifications.css'
import styles from '../styles/Home.module.css'

export default function Terms() {
  const [markdown, setMarkdown] = useState<string>()

  useEffect(() => {
    setMarkdown(require('../../resources/terms.md').default)
  }, [])

  return (
    <div>
      <h1 className={styles.textAlignCenter}>Terms and Conditions</h1>
      <p className={styles.textAlignCenter}>
        Thanks for using our product and services
      </p>
      <Markdown>{markdown + ''}</Markdown>
    </div>
  )
}
