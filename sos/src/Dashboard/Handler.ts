import { http } from "../http"
import { Stats } from "./types"

export const getStats = () => {
    return http<Stats>("GET", "/stats")
}
