import { useContext } from "react"
import { NotificationContext } from "../contexts/NotificationContext"

export function useNotifications() {
	const { successNotification, errorNotification, infoNotification } =
		useContext(NotificationContext)
	return { successNotification, errorNotification, infoNotification }
}
