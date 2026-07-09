import { AnimatePresence, motion } from "framer-motion"

// function ThemeToggle() {
//   const { isDark, toggleDark } = useDark()
//   return (
//     <li onClick={toggleDark} className="cursor-pointer [&_*]:cursor-pointer transition-all">
//       <span className={$("inline-block", isDark ? "i-ph-moon-stars-duotone" : "i-ph:sun-dim-duotone")} />
//       <span>
//         {isDark ? "浅色模式" : "深色模式"}
//       </span>
//     </li>
//   )
// }

export function Menu() {
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)
  const [qrCode, setQrCode] = useState<"mp" | "mini" | null>(null)
  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <span className="flex items-center scale-90">
        {
          enableLogin && loggedIn && userInfo.avatar
            ? (
                <button
                  type="button"
                  className="h-6 w-6 rounded-full bg-cover"
                  style={
                    {
                      backgroundImage: `url(${userInfo.avatar}&s=24)`,
                    }
                  }
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
            initial={{
              scale: 0.9,
            }}
            animate={{
              scale: 1,
            }}
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
              <li onClick={() => window.open(Homepage)} className="cursor-pointer [&_*]:cursor-pointer transition-all">
                <span className="i-ph:github-logo-duotone inline-block" />
                <span>Star on Github </span>
              </li>
              <li className="flex gap-2 items-center">
                <a
                  href="https://github.com/GavinGu0/newsnow"
                >
                  <img
                    alt="GitHub stars badge"
                    src="https://img.shields.io/github/stars/GavinGu0/newsnow?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
                <a
                  href="https://github.com/GavinGu0/newsnow/fork"
                >
                  <img
                    alt="GitHub forks badge"
                    src="https://img.shields.io/github/forks/GavinGu0/newsnow?logo=github&style=flat&labelColor=%235e3c40&color=%23614447"
                  />
                </a>
              </li>
              <li onClick={() => setQrCode("mp")} className="cursor-pointer [&_*]:cursor-pointer transition-all">
                <span className="i-ph:wechat-logo-duotone inline-block" />
                <span>关注公众号</span>
              </li>
              <li onClick={() => setQrCode("mini")} className="cursor-pointer [&_*]:cursor-pointer transition-all">
                <span className="i-ph:qr-code-duotone inline-block" />
                <span>使用小程序</span>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
        {qrCode && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrCode(null)}
          >
            <motion.div
              className="bg-base rounded-xl p-4 flex flex-col items-center gap-3 shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={qrCode === "mp" ? "/wechat-mp.jpg" : "/wechat-mini.png"}
                alt={qrCode === "mp" ? "公众号二维码" : "小程序二维码"}
                className="w-64 h-64 object-contain"
              />
              <span className="text-sm font-bold">
                {qrCode === "mp" ? "营迹Camp，发现你身边的露营地" : "营迹Camps，发现你身边的露营地"}
              </span>
              <button
                type="button"
                className="i-ph:x-circle-duotone text-2xl op-70 hover:op-100"
                onClick={() => setQrCode(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
