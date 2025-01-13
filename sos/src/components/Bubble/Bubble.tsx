import { ReactNode } from "react"
import "./styles.less"
import useMediaQuery from "../../UI/useMediaQuery"
type Props = {
  children: ReactNode
}
export const Bubble = ({ children }: Props) => {
  const isDesktop = useMediaQuery("(min-width: 900px)")

  return isDesktop ? <div className="bubble">{children}</div> : <>{children}</>
}
