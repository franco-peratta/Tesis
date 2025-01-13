import { ReactNode, createContext } from "react"
import { notification } from "antd"
import { NotificationPlacement } from "antd/es/notification/interface"

interface NotificationContextType {
	successNotification: (
		description: string,
		message: string,
		placement?: NotificationPlacement
	) => void
	errorNotification: (
		description: string,
		message: string,
		placement?: NotificationPlacement
	) => void
	infoNotification: (
		description: string,
		message: string,
		placement?: NotificationPlacement
	) => void
}

export const NotificationContext = createContext<NotificationContextType>(null!)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [api, contextHolder] = notification.useNotification()

	const successNotification = (
		message: string,
		description: string,
		placement: NotificationPlacement = "topRight"
	) => {
		api.success({
			message,
			description,
			placement
		})
	}

	const errorNotification = (
		message: string,
		description: string,
		placement: NotificationPlacement = "topRight"
	) => {
		api.error({
			message,
			description,
			placement
		})
	}

	const infoNotification = (
		message: string,
		description: string,
		placement: NotificationPlacement = "topRight"
	) => {
		api.info({
			message,
			description,
			placement
		})
	}

	const value = { successNotification, errorNotification, infoNotification }

	return (
		<NotificationContext.Provider value={value}>
			{contextHolder}
			{children}
		</NotificationContext.Provider>
	)
}
