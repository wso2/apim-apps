import { Box, Typography } from "@mui/material";
import { ComponentStory } from "@storybook/react";
import React from "react";
import Accordion from "./Accordion";
import AccordionDetails from "./AccordionDetails";
import AccordionSummary from "./AccordionSummary";
import NestedAccordionContent from "./NestedAccordionContent";

export default {
  title: "Components/Accordion",
  component: Accordion,
};

const Template = (args) => (
  <Box>
    <Accordion square testId="default1-accordion">
      <AccordionSummary
        aria-controls="panel1a-content"
        testId="default1-accordion-summary"
      >
        <Typography variant="h5">Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails testId="default1-accordion-details">
        <Box p={2}>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
    <Accordion square testId="default2-accordion">
      <AccordionSummary
        aria-controls="panel2a-content"
        testId="default2-accordion-summary"
      >
        <Typography variant="h5">Accordion 2</Typography>
      </AccordionSummary>
      <AccordionDetails testId="default2-accordion-details">
        <Box p={2}>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>
);

export const SimpleAccordion = Template.bind({});

const TemplateNestedAccordion = (args) => (
  <Box>
    <Accordion square testId="nested1-accordion">
      <AccordionSummary
        aria-controls="nested1-content"
        testId="nested1-accordion-summary"
      >
        <Typography variant="h5">Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails testId="nested1-accordion-details">
        <NestedAccordionContent>
          <Accordion square testId="inner-nested1-accordion">
            <AccordionSummary
              aria-controls="inner-nested1-content"
              testId="inner-nested1-accordion-summary"
              noPadding
            >
              <Typography variant="h5">Inner Accordion 1</Typography>
            </AccordionSummary>
            <AccordionDetails testId="inner-nested1-accordion-details">
              <Box py={2}>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                  eget.
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion square testId="inner-nested2-accordion">
            <AccordionSummary
              aria-controls="inner-nested2-content"
              testId="inner-nested2-accordion-summary"
              noPadding
            >
              <Typography variant="h5">Inner Accordion 2</Typography>
            </AccordionSummary>
            <AccordionDetails testId="inner-nested2-accordion-details">
              <Box py={2}>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                  eget.
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </NestedAccordionContent>
      </AccordionDetails>
    </Accordion>
    <Accordion square testId="nested2-accordion">
      <AccordionSummary
        aria-controls="nested2-content"
        testId="nested2-accordion-summary"
      >
        <Typography variant="h5">Accordion 2</Typography>
      </AccordionSummary>
      <AccordionDetails testId="nested2-accordion-details">
        <Box p={2}>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>
);

export const SimpleAccordionNested = TemplateNestedAccordion.bind({});

const TransparentTemplate = (args) => (
  <Box px={2}>
    <Accordion square contained={false} testId="transparent-accordion">
      <AccordionSummary
        aria-controls="panel1a-content"
        testId="transparent-accordion-summary"
      >
        <Typography variant="h5">Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails testId="transparent-accordion-details">
        <Box py={3}>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
    <Accordion square contained={false} testId="transparent-accordion">
      <AccordionSummary
        aria-controls="panel2a-content"
        testId="outlined-accordion-summary"
      >
        <Typography variant="h5">Accordion 2</Typography>
      </AccordionSummary>
      <AccordionDetails testId="outlined-accordion-details">
        <Box py={3}>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>
);

export const TransparentAccordion = TransparentTemplate.bind({});

const TemplateNestedAccordionOutlined = (args) => (
  <Box>
    <Accordion bordered square testId="nested1-outlined-accordion">
      <AccordionSummary
        aria-controls="nested1-outlined-content"
        testId="nested1-outlined-accordion-summary"
      >
        <Typography variant="h5">Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails testId="nested1-outlined-accordion-details">
        <NestedAccordionContent>
          <Accordion bordered square testId="inner-nested1-outlined-accordion">
            <AccordionSummary
              aria-controls="inner-nested1-outlined-content"
              testId="inner-nested1-outlined-accordion-summary"
            >
              <Typography variant="h5">Inner Accordion 1</Typography>
            </AccordionSummary>
            <AccordionDetails testId="inner-nested1-outlined-accordion-details">
              <Box p={2}>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                  eget.
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion bordered square testId="inner-nested2-outlined-accordion">
            <AccordionSummary
              aria-controls="inner-nested2-outlined-content"
              testId="inner-nested2-outlined-accordion-summary"
            >
              <Typography variant="h5">Inner Accordion 2</Typography>
            </AccordionSummary>
            <AccordionDetails testId="inner-nested2-outlined-accordion-details">
              <Box p={2}>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
                  eget.
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </NestedAccordionContent>
      </AccordionDetails>
    </Accordion>
    <Accordion bordered square testId="nested2-outlined-accordion">
      <AccordionSummary
        aria-controls="nested2-outlined-content"
        testId="nested2-outlined-accordion-summary"
      >
        <Typography variant="h5">Accordion 2</Typography>
      </AccordionSummary>
      <AccordionDetails testId="nested2-outlined-accordion-details">
        <Box p={2}>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>
);

export const OutlinedNestedAccordion = TemplateNestedAccordionOutlined.bind({});
