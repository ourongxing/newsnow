export function Footer() {
  return (
    <>
      <a href={`${Homepage}/LICENCE`} target="_blank">MIT LICENCE</a>
      <span>
        <span>NewsNow © 2024 By </span>
        <a href={Author.url} target="_blank">
          {Author.name}
        </a>
      </span>
    </>
  )
}
