export function Footer() {
  return (
    <>
      <a href={`${Homepage}/LICENSE`} target="_blank">MIT LICENSE</a>
      <span>
        <span>NewsNow © 2025 By </span>
        <a href={Author.url} target="_blank">
          {Author.name}
        </a>
      </span>
    </>
  )
}
