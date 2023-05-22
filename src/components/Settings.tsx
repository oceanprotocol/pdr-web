import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import styles from '../styles/Settings.module.css'
import Button from './Button'
import Input from './Input'

export default function Settings() {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <div className={styles.container}>
      <FontAwesomeIcon
        icon={faGear}
        height={30}
        onClick={() => setOpen(!open)}
      />
      {open ? (
        <div className={styles.modal}>
          <span className={styles.title}>Kraken Config</span>
          <div className={styles.inputSection}>
            <Input label="API Key" value={''} type="text" onChange={() => {}} />
          </div>
          <Button text="SAVE" onClick={() => {}} className={styles.button} />
        </div>
      ) : (
        ''
      )}
    </div>
  )
}
