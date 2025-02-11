/* eslint-disable */
/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface CustomizedAccordionsProps {
  title: string;
  description: string;
  onAdd: (title: string) => void;
  onRemove: (title: string) => void;
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps & { active: boolean }) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme, active }) => ({
  backgroundColor: active ? '#bbe7f0' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginLeft: 'auto',
}));

const CustomizedAccordions: React.FC<CustomizedAccordionsProps> = ({ title, description, onAdd, onRemove }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [isAdded, setIsAdded] = React.useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleButtonClick = () => {
    if (isAdded) {
      onRemove(title);
    } else {
      onAdd(title);
    }
    setIsAdded(!isAdded);
  };

  return (
    <div>
      <Accordion expanded={expanded} onChange={handleToggleExpand}>
        <AccordionSummary active={isAdded}>
          <Typography>{title}</Typography>
          <StyledButton
            variant="contained"
            color={isAdded ? 'error' : 'primary'}
            onClick={(event) => {
              event.stopPropagation();
              handleButtonClick();
            }}
          >
            {isAdded ? 'REMOVE' : 'ADD'}
          </StyledButton>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{description}</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CustomizedAccordions;
