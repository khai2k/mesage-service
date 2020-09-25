export function getPagination({ query: { itemPerPage = 50, page = 1 } }, totalItem) {
  page = parseInt(page)
  totalItem = parseInt(totalItem)
  itemPerPage = parseInt(itemPerPage)

  return {
    totalItem,
    itemPerPage,
    page,
    minIndex: (page - 1) * itemPerPage,
    maxIndex: page * itemPerPage
  }
}
