import { Spin } from "antd"

export const Loader = () => {
  return (
    <div className="flex--centered height--full">
      <Spin size="large" />
    </div>
  )
}
