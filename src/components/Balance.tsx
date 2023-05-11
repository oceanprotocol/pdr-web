import { useUserContext } from '../contexts/UserContext'

// TODO - Fix balance component so it stops throwing errors into the console
export default function Balance() {
  const { balance } = useUserContext()
  return <div>Balance: {balance} OCEAN</div>
}
