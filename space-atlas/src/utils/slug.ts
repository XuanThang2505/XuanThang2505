/** File-name friendly key for a spoken text: "Saturn has shiny rings!" → "saturn-has-shiny-rings". */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
