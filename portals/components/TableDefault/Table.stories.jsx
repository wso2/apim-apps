import React, { useState } from 'react';
import { Box, Typography, Toolbar, Tooltip, Card, Checkbox } from '@mui/material';
import clsx from 'clsx';
import ConstructionIcon from '@mui/icons-material/Construction';
import Pagination from '../Pagination/Pagination';

import Table from './Table';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableContainer from './TableContainer';
import TableHead from './TableHead';
import TableRow from './TableRow';
import TableSortLabel from './TableSortLabel';
import Button from '../buttons/Button';
import TableToolBar from './TableToolBar';
import Avatar from '../Avatar/Avatar';
import useTableStyles from './Table.styles';
import TableRowNoData from './TableRowNoData';

const rows = [
  { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
  { name: 'Donut', calories: 452, fat: 25.0, carbs: 51, protein: 4.9 },
  { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24, protein: 6.0 },
  { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
  { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
  { name: 'Honeycomb', calories: 408, fat: 3.2, carbs: 87, protein: 6.5 },
];

const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)' },
  { id: 'calories', numeric: true, disablePadding: false, label: 'Calories' },
  { id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)' },
  { id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)' },
  { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' },
];

const EnhancedTableHead = ({ numSelected, onSelectAllClick, order, orderBy, onRequestSort, rowCount }) => {
  const classes = useTableStyles();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Tooltip title="Select all">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              testId="table-head"
            />
          </Tooltip>
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'}>
            <TableSortLabel active={orderBy === headCell.id} direction={order} onClick={createSortHandler(headCell.id)}>
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell padding="checkbox" />
      </TableRow>
    </TableHead>
  );
};

// Storybook Configuration
export default {
  title: 'Components/TableDefault',
  component: Table,
};

const TemplateDefault = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? rows.map((n) => n.name) : []);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [...selected];

    if (selectedIndex === -1) {
      newSelected.push(name);
    } else {
      newSelected.splice(selectedIndex, 1);
    }

    setSelected(newSelected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  return (
    <Box>
      <Card testId="table-story">
        <Box m={3}>
          <TableToolBar numSelected={selected.length} />
          <TableContainer>
            <Table>
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      key={row.name}
                      selected={isItemSelected}
                      disabled={index === 4}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} testId="table-row-checkbox" />
                      </TableCell>
                      <TableCell id={labelId} scope="row" padding="none">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar testId="avatar">{row.name.charAt(0)}</Avatar>
                          <Typography variant="caption">{row.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row.calories}</TableCell>
                      <TableCell align="right">{row.fat}</TableCell>
                      <TableCell align="right">{row.carbs}</TableCell>
                      <TableCell align="right">{row.protein}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="tiny"
                          variant="link"
                          testId="config"
                          startIcon={<ConstructionIcon />}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Config
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box px={2} py={1}>
            <Pagination
              rowsPerPageOptions={[5, 10, 25]}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={setPage}
              onRowsPerPageChange={(value) => setRowsPerPage(parseInt(value, 10))}
              testId="rows-per-page"
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
export const Default = TemplateDefault.bind({});