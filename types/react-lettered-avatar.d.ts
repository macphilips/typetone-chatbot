declare module "react-lettered-avatar" {
  import type React from "react"

  export interface LetteredAvatarProps {
    className: string
    name: string
    color: string
    backgroundColor: string
    backgroundColors: string[]
    size?: number
    radius?: number
    radius?: number
  }

  declare const LetteredAvatar: React.SFC<LetteredAvatarProps>

  export default LetteredAvatar
}
