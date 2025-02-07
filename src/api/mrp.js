async function getStockSummaryApi(params) {
  return fetch(
    `${process.env.REACT_APP_API}/stock-summary?schema=${params.schema}&month=${params.month}&brand=${params.brand}&year=${params.year}`
  )
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

async function getMrpApi() {
  return fetch(`${process.env.REACT_APP_API}/mrp?schema=DB_AA_TEST`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

export { getMrpApi, getStockSummaryApi };
