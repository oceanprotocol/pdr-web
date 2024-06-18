import styles from '../styles/Banner.module.css'

type TCustomBannerProps = {
    children?: React.ReactNode,
    bannerType: 'warning' | 'error' | 'pink' | 'light-pink' | 'white-with-border'
}

export const CustomBanner: React.FC<TCustomBannerProps> = ({
    children,
    bannerType
}) =>
    <div
        className={`${styles.container} ${styles[bannerType]}`}
    >
        {children}
    </div>
