import { motion } from "framer-motion"
import { useState } from "react"

export function Menu() {
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)

  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <span className="flex items-center scale-90">
        {enableLogin && loggedIn && userInfo.avatar ? (
          <button
            type="button"
            className="h-6 w-6 rounded-full bg-cover"
            style={{ backgroundImage: `url(${userInfo.avatar}&s=24)` }}
          />
        ) : (
          <button type="button" className="btn i-si:more-muted-horiz-circle-duotone" />
        )}
      </span>

      {shown && (
        <div className="absolute right-0 z-99 bg-transparent pt-4 top-4">
          <motion.div
            id="dropdown-menu"
            className={$([
              "w-200px",
              "bg-primary backdrop-blur-5 bg-op-70! rounded-lg shadow-xl",
            ])}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <ol className="bg-base bg-op-70! backdrop-blur-md p-2 rounded-lg color-base text-base">
              {enableLogin && (loggedIn ? (
                <li onClick={logout}>
                  <span className="i-ph:sign-out-duotone inline-block" />
                  <span>退出登录</span>
                </li>
              ) : (
                <li onClick={login}>
                  <span className="i-ph:sign-in-duotone inline-block" />
                  <span>Github 账号登录</span>
                </li>
              ))}

              {/* Telegram 按钮 - 蓝色风格 */}
              <li
                onClick={() => window.open("https://t.me/worldstarshare")}
                className="cursor-pointer [&_*]:cursor-pointer transition-all flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-600 hover:text-white"
              >
                <span className="i-ph:telegram-logo-duotone text-blue-500" />
                <span className="font-medium">加入 Telegram</span>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
