import s from '../styles/BurgerMenuButton.module.css'

export type TBurgerMenuButtonProps = {
  onClick: () => void
  className?: string
}
export const BurgerMenuButton: React.FC<TBurgerMenuButtonProps> = ({
  onClick,
  className
}) => {
  return (
    <div onClick={() => onClick()} className={className}>
      <div className={s.burgerLine}></div>
      <div className={s.burgerLine}></div>
      <div className={s.burgerLine}></div>
    </div>
  )
}
