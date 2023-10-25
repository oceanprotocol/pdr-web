import s from '../styles/BurgerMenuButton.module.css'

export type TBurgerMenuButtonProps = {
  onClick: () => void
}
export const BurgerMenuButton: React.FC<TBurgerMenuButtonProps> = ({
  onClick
}) => {
  return (
    <div onClick={() => onClick()}>
      <div className={s.burgerLine}></div>
      <div className={s.burgerLine}></div>
      <div className={s.burgerLine}></div>
    </div>
  )
}
