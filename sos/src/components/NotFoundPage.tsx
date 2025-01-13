import { Button, Typography } from "antd"
import { useNavigate } from "react-router-dom"
import { ReactComponent as NotFoundImage } from "./assets/not-found.svg"
import { Bubble } from "./Bubble"

const { Title } = Typography

type Props = {}
export const NotFoundPage = (props: Props) => {
  const navigate = useNavigate()

  return (
    <Bubble>
      <div className="flex--centered flex--columns">
        <NotFoundImage height="75%" width="75%" />
        <br></br>
        <Title level={2}>
          No hemos encontrado la pagina que estas buscando
        </Title>
        <br></br>

        <Button type="primary" size="large" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    </Bubble>
  )
}
