import { useUserContext } from '@/contexts/UserContext'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import styles from '../styles/Settings.module.css'
import Button from './Button'
import Input from './Input'

export default function Settings() {
  const [open, setOpen] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<string>()
  const [secretKey, setSecretKey] = useState<string>()
  const { krakenApiKey, krakenSecretKey, setKrakenApiKey, setKrakenSecretKey } =
    useUserContext()
  return (
    <div
      className={`${styles.container} ${
        (!krakenApiKey || !krakenSecretKey) && styles.warning
      }`}
    >
      {!krakenApiKey || !krakenSecretKey ? (
        <p className={styles.message}>
          Trading disabled. Kraken API keys not configured.
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
                label="API Key"
                value={
                  krakenApiKey
                    ? `${krakenApiKey?.substring(
                        0,
                        4
                      )}...${krakenApiKey?.substring(
                        krakenApiKey.length - 4,
                        krakenApiKey.length
                      )}`
                    : apiKey
                }
                type="text"
                disabled={krakenApiKey !== undefined}
                onChange={setApiKey}
              />
              <Input
                label="Secret Key"
                value={
                  krakenApiKey
                    ? `${krakenSecretKey?.substring(
                        0,
                        4
                      )}...${krakenSecretKey?.substring(
                        krakenSecretKey.length - 4,
                        krakenSecretKey.length
                      )}`
                    : secretKey
                }
                type="text"
                disabled={krakenSecretKey !== undefined}
                onChange={setSecretKey}
              />
            </div>
            <Button
              text={krakenApiKey && krakenSecretKey ? 'REMOVE' : 'SAVE'}
              onClick={() => {
                setKrakenApiKey &&
                  setKrakenApiKey(krakenApiKey ? undefined : apiKey)
                setKrakenSecretKey &&
                  setKrakenSecretKey(krakenSecretKey ? undefined : secretKey)
              }}
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
