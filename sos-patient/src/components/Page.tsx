import { Outlet, useNavigate } from "react-router-dom"
import { Layout, Avatar, Dropdown, Menu, Image, Typography } from "antd"
import { UserOutlined, LogoutOutlined } from "@ant-design/icons"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

const { Header, Footer } = Layout
const { Link } = Typography

export function Page() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				maxHeight: "100vh",
				maxWidth: "100vw"
			}}
		>
			<CustomHeader />
			<main
				style={{
					height: "100%",
					margin: "0 1em",
					overflow: "auto"
				}}
			>
				<Outlet />
			</main>
			<Footer style={{ textAlign: "center" }}>
				<strong>
					<Link href="https://saludonlinesolidaria.com/" target="_blank">
						Salud Online Solidaria
					</Link>
				</strong>{" "}
				©2025
			</Footer>
		</div>
	)
}

const headerStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: "0 1em",
	backgroundColor: "#001529",
	color: "#fff"
}

const avatarStyle = {
	backgroundColor: "lightgray"
}

export const CustomHeader = () => {
	const [menuVisible, setMenuVisible] = useState(false)
	const navigate = useNavigate()
	const { user, signout } = useAuth()

	const handleMenuVisibleChange = (visible: boolean) => {
		setMenuVisible(visible)
	}

	const handleMenuClick = (e: any) => {
		if (e.key === "logout") {
			signout()
		}
		if (e.key === "profile") {
			navigate("/profile")
		}
	}

	const menu = (
		<Menu onClick={handleMenuClick}>
			<Menu.Item key="profile" icon={<UserOutlined />}>
				Perfil
			</Menu.Item>
			<Menu.Item key="logout" icon={<LogoutOutlined />}>
				Cerrar sesión
			</Menu.Item>
		</Menu>
	)

	return (
		<Header style={headerStyle}>
			<Image
				style={{ cursor: "pointer", height: "4em" }}
				src="/img/sos-logo.png"
				alt="Salud Online Solidaria"
				preview={false}
				onClick={() => navigate("/")}
			/>
			{user ? (
				<Dropdown
					overlay={menu}
					trigger={["click"]}
					visible={menuVisible}
					onVisibleChange={handleMenuVisibleChange}
				>
					<Avatar style={avatarStyle} size="large" icon={<UserOutlined />} />
				</Dropdown>
			) : null}
		</Header>
	)
}
