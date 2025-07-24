import { getUrlParams } from "../helpers/api";

async function createPurchaseOrderDraftApi(params, data) {
  const parsedData = {
    CardCode: data.U_provider_code,
    Comments: data.description,
    DocCurrency: data.U_currency,
    DocObjectCode: "oPurchaseOrders",
    U_GB_MBSecuencia: data.U_mrp_code,
    DocumentLines: data.detail
      .filter((item) => item.U_order_amount > 0)
      .map((item) => ({
        ItemCode: item.U_item_code,
        Quantity: item.U_order_amount,
        UnitPrice: parseFloat(item.price),
        WarehouseCode: "IMPORT",
      })),
  };
  console.log(parsedData);

  const sessionId = JSON.parse(sessionStorage.getItem("SESSION")).SessionId;

  return fetch(
    `${process.env.REACT_APP_API}/drafts/purchase-order${getUrlParams({
      sessionId,
      ...params,
    })}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.error == true) {
        throw new Error(data.body);
      }

      //return data;
    })
    .catch((err) => {
      throw err;
    });
}

export { createPurchaseOrderDraftApi };
