import React from "react";
import TableCell from "./TableCell";
import NoDataMessage from "../NoDataMessage/NoDataMessage";
import TableRow from "./TableRow";

function TableRowNoData(props) {
  const { testId, message, colSpan = 1 } = props;

  return (
    <TableRow noBorderBottom>
      <TableCell colSpan={colSpan}>
        <NoDataMessage testId={testId} message={message} />
      </TableCell>
    </TableRow>
  );
}

export default TableRowNoData;
