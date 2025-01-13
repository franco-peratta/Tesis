import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Routing } from "./components/Routes"
import { ConfigProvider } from "antd"
import locale from "antd/locale/es_ES"

export default function App() {
	return (
		<AuthProvider>
			<NotificationProvider>
				<ConfigProvider locale={locale}>
					<Routing />
				</ConfigProvider>
			</NotificationProvider>
		</AuthProvider>
	)
}
