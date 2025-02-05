import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Card from "../Card/Card";
import { Box, Grid, Typography } from "@mui/material";
import CardContent from "../Card/CardContent";
import ExpandableSearch from "./ExpandableSearch";

export default {
  title: "Components/SearchBar",
  component: SearchBar,
  argTypes: {
    onChange: { action: "changed" },
    onFilterChange: { action: "filter changed" },
    placeholder: { control: "text" },
    iconPlacement: {
      control: "radio",
      options: ["left", "right"],
    },
    size: {
      control: "radio",
      options: ["small", "medium"],
    },
    color: {
      control: "select",
      options: [null, "secondary"],
    },
    bordered: { control: "boolean" },
    filterValue: { control: "text" },
    filterItems: { control: "object" },
    inputValue: { control: "text" },
  },
};

const Template = (args) => <SearchBar {...args}>{args.children}</SearchBar>;

export const Default = (args) => (
  <Card testId="default-search">
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Box mb={2}>
            <Typography>Size - Small</Typography>
          </Box>
          <SearchBar
            size="small"
            testId="search-bar-default"
            onChange={() => {}}
            placeholder="Search"
          />
        </Grid>
        <Grid item xs={8}>
          <Box mb={2}>
            <Typography>Size - Medium(default)</Typography>
          </Box>
          <SearchBar
            size="medium"
            testId="search-bar-default"
            onChange={() => {}}
            placeholder="Search"
          />
        </Grid>
        <Grid item xs={8}>
          <Box mb={2}>
            <Typography>Color - Secondary </Typography>
          </Box>
          <SearchBar
            size="medium"
            testId="search-bar-default"
            onChange={() => {}}
            placeholder="Search"
            color="secondary"
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export const TemplateDefaultRight = (args) => (
  <Card testId="card-default-search-bar-wrapper">
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <SearchBar
            testId="search-bar-default-right"
            onChange={() => {}}
            placeholder="Search"
            iconPlacement="right"
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export const TemplateExpandable = (args) => {
  const [searchVal, setSearchVal] = useState("");

  return (
    <Card testId="card-default-right-search-bar-wrapper">
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={10}>
            <Box mb={2}>
              <Typography>Size - Small</Typography>
            </Box>
            <ExpandableSearch
              size="small"
              testId="search-expandable"
              setSearchString={setSearchVal}
              searchString={searchVal}
            />
          </Grid>
          <Grid item xs={10}>
            <Box mb={2}>
              <Typography>Size - Medium(default)</Typography>
            </Box>
            <ExpandableSearch
              size="medium"
              testId="search-expandable"
              setSearchString={setSearchVal}
              searchString={searchVal}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const TemplateSearchWithFilter = (args) => {
  const [filterValue, setFilterValue] = useState("all");
  const handleFilterChange = (value) => {
    setFilterValue(value);
  };
  return (
    <Card testId="search-bar">
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <SearchBar
              testId="search-bar-end-action"
              onChange={() => {}}
              placeholder="Search"
              filterValue={filterValue}
              onFilterChange={handleFilterChange}
              filterItems={[
                { value: "all", label: "All" },
                { value: "name", label: "Name" },
                { value: "description", label: "Description" },
              ]}
            />
          </Grid>
          <Grid item xs={8}>
            <SearchBar
              testId="search-bar-end-action"
              onChange={() => {}}
              placeholder="Search"
              filterValue={filterValue}
              onFilterChange={handleFilterChange}
              filterItems={[
                { value: "all", label: "All" },
                { value: "name", label: "Name" },
                { value: "description", label: "Description" },
              ]}
              bordered
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

