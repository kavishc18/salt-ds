import { ColDef } from "ag-grid-community";

const dataGridExampleColumns: ColDef[] = [
  {
    headerName: "",
    field: "on",
    width: 70,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: "left",
    suppressMenu: true,
    resizable: false,
  },
  {
    headerName: "Name",
    field: "name",
    filterParams: {
      buttons: ["reset", "apply"],
    },
    editable: false,
  },
  {
    headerName: "Code",
    field: "code",
  },
  {
    headerName: "Capital",
    field: "capital",
  },
  {
    headerName: "Population",
    type: "numericColumn",
    field: "population",
    filter: "agNumberColumnFilter",
    editable: true,
    cellClass: ["numeric-cell", "editable-cell"],
  },
  {
    headerName: "Date",
    type: "dateColumn",
    field: "date",
    filter: "agDateColumnFilter",
  },
];
export default dataGridExampleColumns;
