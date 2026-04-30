export function Footer() {
  return (
    <>
      <a href={`${Homepage}/LICENCE`} target="_blank" className="text-[#8888a0] dark:text-[#5c6378] hover:text-[#1a1a2e] dark:hover:text-[#9aa0b0] transition-colors-200">MIT LICENCE</a>
      <span className="text-[#8888a0] dark:text-[#5c6378]">
        <span>NewsNow © 2024 By </span>
        <a href={Author.url} target="_blank" className="text-[#1a1a2e] dark:text-[#9aa0b0] hover:text-[#000] dark:hover:text-[#e8eaed] transition-colors-200">
          {Author.name}
        </a>
      </span>
    </>
  )
}
