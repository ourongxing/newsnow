export function Footer() {
  return (
    <>
      <a href={`${Homepage}/blob/main/LICENSE`} target="_blank">MIT LICENSE</a>
      <span>
        <span>NewsNow © 2026 by </span>
        <a href={Author.url} target="_blank">
          {Author.name}
        </a>
        <span> · based on </span>
        <a href={OriginalProject.url} target="_blank">
          {OriginalProject.name}
        </a>
        <span> by </span>
        <a href={OriginalAuthor.url} target="_blank">
          {OriginalAuthor.name}
        </a>
      </span>
    </>
  )
}
