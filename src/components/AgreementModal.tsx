import Button from '@/elements/Button'
import { useEffect, useState } from 'react'
import Modal from 'react-modal'
import styles from '../styles/AgreementModal.module.css'

//Modal.setAppElement('#agreementModal')

export default function AgreementModal() {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [agreed, setAgreed] = useState<boolean>(false)
  const onContinue = () => {
    localStorage.setItem('termsOfUse', 'agreed')
    setIsOpen(false)
  }
  useEffect(() => {
    setIsOpen(localStorage.getItem('termsOfUse') ? false : true)
  }, [])
  return (
    <Modal
      isOpen={isOpen}
      contentLabel="Example Modal"
      className={styles.modal}
    >
      <div className={styles.content}>
        <h2>Welcome!</h2>
        <p>Before using our app, make sure you are aware of our term of use</p>
        <div className={styles.inputContainer}>
          <input
            type="checkbox"
            defaultChecked={agreed}
            onClick={(e) => {
              setAgreed((prev) => !prev)
            }}
          />
          <label htmlFor="checkbox">
            I have read and I agree to the Terms of use of this website
          </label>
        </div>
        <Button
          text="Continue"
          onClick={() => onContinue()}
          disabled={!agreed}
        />
      </div>
    </Modal>
  )
}
