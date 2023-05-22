import { useUserContext } from '@/contexts/UserContext'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import styles from '../styles/Settings.module.css'
import Button from './Button'
import Input from './Input'

export default function Settings() {
  const [open, setOpen] = useState<boolean>(false)
  const [privateKey, setPrivateKey] = useState<string>()
  const { krakenPrivateKey, setKrakenPrivateKey } = useUserContext()
  return (
    <div
      className={`${styles.container} ${!krakenPrivateKey && styles.warning}`}
    >
      {!krakenPrivateKey ? (
        <p className={styles.message}>
          Trading disabled. Kraken private key not configured.
        </p>
      ) : (
        ''
      )}
      <div className={styles.settingsConfig}>
        <FontAwesomeIcon
          icon={faGear}
          height={30}
          onClick={() => setOpen(!open)}
        />
        {open ? (
          <div className={styles.modal}>
            <span className={styles.title}>Kraken Config</span>
            <div className={styles.inputSection}>
              <Input
                label="Private Key"
                value={
                  krakenPrivateKey
                    ? `${privateKey?.substring(0, 4)}...${privateKey?.substring(
                        privateKey.length - 4,
                        privateKey.length
                      )}`
                    : privateKey
                }
                type="text"
                disabled={krakenPrivateKey !== undefined}
                onChange={setPrivateKey}
              />
            </div>
            <Button
              text={krakenPrivateKey ? 'REMOVE' : 'SAVE'}
              onClick={() =>
                setKrakenPrivateKey &&
                setKrakenPrivateKey(krakenPrivateKey ? undefined : privateKey)
              }
              className={styles.button}
            />
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
