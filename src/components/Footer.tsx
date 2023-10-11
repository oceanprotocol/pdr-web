import footerStyles from '@/styles/Footer.module.css'
import Link from 'next/link'
import buttonStyles from '../styles/Button.module.css'

export default function Footer() {
  return (
    <div className={footerStyles.container}>
      <div className={footerStyles.container}>
        <p className={footerStyles.message}>
          Want to be up to date or get support? Join our Discord channel.
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
      <div className={`${footerStyles.link}`}>
        <Link href="/terms">Terms&Conditions</Link>
        <Link href="/">Home</Link>
      </div>
    </div>
  )
}
