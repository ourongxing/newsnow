import { motion } from "framer-motion"

// function ThemeToggle() {
//   const { isDark, toggleDark } = useDark()
//   return (
//     <li onClick={toggleDark} className="cursor-pointer [&_*]:cursor-pointer transition-all">
//       <span className={$("inline-block", isDark ? "i-ph-moon-stars-duotone" : "i-ph-sun-dim-duotone")} />
//       <span>
//         {isDark ? "浅色模式" : "深色模式"}
//       </span>
//     </li>
//   )
// }

export function Menu() {
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)

  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <span className="flex items-center scale-90">
        {
          enableLogin && loggedIn && userInfo.avatar
            ? (
                <button
                  type="button"
                  className="h-6 w-6 rounded-full bg-cover"
                  style={{
                    backgroundImage: `url(${userInfo.avatar}&s=24)`,
                  }}
                >
                </button>
              )
            : <button type="button" className="btn i-si:more-muted-horiz-circle-duotone" />
        }
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
              {enableLogin && (loggedIn
                ? (
                    <li onClick={logout}>
                      <span className="i-ph:sign-out-duotone inline-block" />
                      <span>退出登录</span>
                    </li>
                  )
                : (
                    <li onClick={login}>
                      <span className="i-ph:sign-in-duotone inline-block" />
                      <span>Github 账号登录</span>
                    </li>
                  ))}

              {/* <ThemeToggle /> */}

              {/* 改为 Telegram 链接 */}
              <li
                onClick={() => window.open("https://t.me/worldstarshare")}
                className="cursor-pointer [&_*]:cursor-pointer transition-all"
              >
                <span className="i-ph:telegram-logo-duotone inline-block" />
                <span>加入 Telegram</span>
              </li>

              {/* 删除了 GitHub stars/forks badge 部分 */}
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
