import React from "react";
import DataTable from "react-data-table-component";

const CustomDatatable = ({ data, columns }) => {
  //rows, headCells, cells
  const tableStyles = {
    responsiveWrapper: {
      style: {
        marginTop: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        boxShadow: "0 -6px 15px 0 rgba(0, 0, 0, 0.1)",
        backgroundColor: "#F2F5FF",
      },
    },
    table: {
      style: {
        padding: 0,
        fontFamily: "Poppins",
        fontSize: 16,
      },
    },

    headCells: {
      style: {
        backgroundColor: "black",
        color: "#F2F5FF",
        fontSize: "16px",
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
        fontSize: 15,
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
        fontSize: 16,
      },
    },
  };

  return (
    <DataTable
      customStyles={tableStyles}
      data={data}
      columns={columns}
      pagination
    />
  );
};

export default CustomDatatable;
