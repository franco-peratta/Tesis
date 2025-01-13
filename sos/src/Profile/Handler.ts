import { http } from "../http"
import { Provider } from "./Model"

export const getUserProfileById = async (id: string) => {
  return http<Provider>("GET", `/provider/${id}`)
}

export const updateUserProfile = async (id: string, data: Provider) => {
  return http<Provider>("PUT", `/provider/${id}`, { params: data })
}
