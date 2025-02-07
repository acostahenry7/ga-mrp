function getSuggestedAmount(data) {
  if (!data) {
    return;
  }

  //INV + TRAN
  const stock = parseFloat(data.inv_stock) + parseFloat(data.inv_transit);
  //DEMANDA PROMEDIO
  const avgDemand =
    data.amounts.reduce((acc, i) => acc + parseInt(i), 0) / data.amounts.length;
  //VARIACION VENTAS
  const salesVariance = getPVariance(data.amounts);

  //DESVIACION ESTANDAR
  const standardDeviation = Math.sqrt(
    salesVariance + parseFloat(data.brand.U_leadtime_variance_index)
  );

  //STOCK DE SEGURIDAD
  const safetyStock = Math.round(
    standardDeviation * parseFloat(data.brand.U_service_level)
  );

  //PUNTO DE REEORDEN
  const reorderPoint =
    avgDemand * parseFloat(data.brand.U_leadtime) + safetyStock;

  //SUGERIDO
  const suggestedAmount =
    reorderPoint - stock + avgDemand * parseFloat(data.brand.U_leadtime);

  //   console.log({
  //     serviceLevel: data.U_service_level,
  //     stock,
  //     avgDemand,
  //     salesVariance,
  //     standardDeviation,
  //     safetyStock,
  //     reorderPoint,
  //     suggestedAmount,
  //   });

  return {
    stock,
    avgDemand,
    salesVariance,
    standardDeviation,
    safetyStock,
    reorderPoint,
    suggestedAmount: suggestedAmount > 0 ? suggestedAmount : 0,
  };
}

function getPVariance(arr) {
  const x = arr.reduce((acc, i) => acc + parseInt(i), 0) / arr.length;

  let sum = 0;
  for (let i of arr) {
    sum += (i - x) * (i - x);
  }

  return sum / arr.length;
}

export { getSuggestedAmount };
