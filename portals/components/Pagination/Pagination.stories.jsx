import React from "react";
import { Box } from "@mui/material";
import Pagination from "./Pagination";

export default {
  title: "Components/Pagination",
  component: Pagination,
};

const Template = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  return (
    <Box display="flex">
      <Pagination
        rowsPerPageOptions={[5, 10, 15, 20]}
        count={25}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageLabel="Items per page"
        testId="items-per-page"
      />
    </Box>
  );
};

export const Primary = Template.bind({});
