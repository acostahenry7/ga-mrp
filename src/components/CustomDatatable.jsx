import React from "react";
import DataTable from "react-data-table-component";
import { GiEmptyWoodBucket } from "react-icons/gi";
import { DNA } from "react-loader-spinner";

const CustomDatatable = ({ data, columns, isLoading, shadow }) => {
  //rows, headCells, cells
  const tableStyles = {
    responsiveWrapper: {
      style: {
        marginTop: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        boxShadow: shadow == true ? "0 -6px 15px 0 rgba(0, 0, 0, 0.1)" : "",
        backgroundColor: "#F2F5FF",
      },
    },
    table: {
      style: {
        // padding: 0,
        // fontFamily: "Poppins",
        // fontSize: 10,
      },
    },

    headCells: {
      style: {
        backgroundColor: "black",
        color: "#F2F5FF",
        fontSize: 14,
        fontWeight: 500,
        height: 68,
        fontWeight: 400,
      },
    },

    rows: {
      style: {
        height: 45,
        backgroundColor: "#F2F5FF",
        fontFamily: "Poppins",
        fontSize: 12,
        color: "#828080",
        fontWeight: 400,
      },
    },
    pagination: {
      style: {
        height: 45,
        backgroundColor: "#F2F5FF",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        boxShadow: "0 0 8px 0 rgba(0, 0, 0, 0.1)",
        // justifyContent: "center",
        // flexDirectios: "row-reverse",
        fontFamily: "Poppins",
        fontSize: 14,
      },
    },
    noData: {
      style: {
        backgroundColor: "#F2F5FF",
      },
    },
    progress: {
      style: {
        height: 160,
        backgroundColor: "#F2F5FF",
      },
    },
  };

  return (
    <DataTable
      customStyles={tableStyles}
      data={data}
      columns={columns}
      pagination
      progressPending={isLoading}
      progressComponent={
        <DNA wrapperStyle={{ opacity: 0.6 }} height="80" width="80" />
      }
      noDataComponent={
        <p className="py-11 flex flex-col items-center gap-3 opacity-70">
          <GiEmptyWoodBucket color="lightgray" size={40} />
          <span className="font-roboto text-slate-400 text-sm">
            No se encontraron registros
          </span>
        </p>
      }
      paginationComponentOptions={{
        selectAllRowsItem: true,
        selectAllRowsItemText: "Todos",
      }}

      // paginationRowsPerPageOptions={{
      //   selectAllRowsItem: true,
      // }}
      //selectableRows
      // onChangePage={() => {

      // }}
    />
  );
};

export default CustomDatatable;
