async function getMrpApi() {
  return fetch(`${process.env.REACT_APP_API}/mrp?schema=DB_AA_TEST`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

export { getMrpApi };
