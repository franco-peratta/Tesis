export const formatStatusName = (status: string) => {
	const str = status.replace(/_/g, " ")
	return str.charAt(0).toUpperCase() + str.slice(1)
}
