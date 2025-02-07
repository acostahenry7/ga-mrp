import React from "react";
import Button from "./Button";
import { BiSearch } from "react-icons/bi";
import DtFilterWrapper from "./DtFilterWrapper";

const DtFilter = () => {
  const currentYear = new Date().getFullYear();

  const getYearListFromYear = (targetYear) => {
    return Array(11)
      .fill(0)
      .map((item, index) => targetYear - index);
  };

  return (
    <DtFilterWrapper className="">
      <FilterWrapper>
        <label htmlFor="">Búsqueda</label>
        <input className="filter-input" placeholder="Buscar..." />
      </FilterWrapper>
      <FilterWrapper>
        <label htmlFor="">Marca</label>
        <select className="filter-input">
          <option value="">Seleccionar Marca</option>
        </select>
      </FilterWrapper>
      <FilterWrapper>
        <label htmlFor="">Período sugerido</label>
        <div className="flex gap-2 flex-wrap mt-3 sm:mt-0 sm:pl-0">
          <div className="flex items-center">
            <label className="w-12">Desde</label>
            <div>
              <select className="filter-input ml-2" name="" id="">
                {getYearListFromYear(currentYear).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select className="filter-input ml-2" name="" id="">
                {Array(12)
                  .fill(0)
                  .map((i, index) => (
                    <option key={index} value={index + 1}>
                      {index < 9 ? `0${index + 1}` : index + 1}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          {/* <div className="flex items-center">
            <label className="w-12">Hasta</label>
            <div>
              <select className="filter-input ml-2" name="" id="">
                {getYearListFromYear(currentYear + 1).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select className="filter-input ml-2" name="" id="">
                {Array(12)
                  .fill(0)
                  .map((i, index) => (
                    <option key={index} value={index + 1}>
                      {index < 9 ? `0${index + 1}` : index + 1}
                    </option>
                  ))}
              </select>
            </div>
          </div> */}
        </div>
      </FilterWrapper>

      <div className="self-end justify-end mb-1 w-full sm:w-[172px]">
        <Button
          title={"Buscar"}
          variant="light"
          width={"100%"}
          icon={<BiSearch size={16} />}
        />
      </div>
    </DtFilterWrapper>
  );
};

export const FilterWrapper = ({ children }) => {
  return (
    <div className="sm:w-auto w-full flex flex-col justify-center">
      {children}
    </div>
  );
};

export default DtFilter;
