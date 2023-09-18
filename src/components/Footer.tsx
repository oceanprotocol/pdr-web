import footerStyles from '@/styles/Footer.module.css'
import buttonStyles from '../styles/Button.module.css'

export default function Footer() {
  return (
    <div className={footerStyles.container}>
      <p className={footerStyles.message}>
        Want to be notified when mainnet goes live? Follow us on Discord.
      </p>
      <a
        href="https://discord.gg/kfrZ8wuTKc"
        className={`${buttonStyles.button}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Discord
      </a>
    </div>
  )
}
