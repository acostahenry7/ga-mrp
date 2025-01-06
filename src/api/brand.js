async function getBrandApi(params) {
  return fetch(`${process.env.REACT_APP_API}/brand?schema=${params.schema}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

export { getBrandApi };
