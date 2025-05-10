import { notification } from "antd"
import { NotificationPlacement } from "antd/es/notification/interface"

const PLACEMENT: NotificationPlacement = "topRight"

export const infoNotification = (description: string) => {
  notification.info({
    message: "Atencion",
    description,
    placement: PLACEMENT
  })
}

export const successNotification = (description: string) => {
  notification.success({
    message: "Exito",
    description,
    placement: PLACEMENT
  })
}

export const errorNotification = (description: string) => {
  notification.error({
    message: "Error",
    description,
    placement: PLACEMENT
  })
}
