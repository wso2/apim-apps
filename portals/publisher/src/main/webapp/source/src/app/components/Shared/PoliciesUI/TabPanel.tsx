import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import type { Policy } from './Types';

interface TabPanelSharedProps {
    children?: React.ReactNode;
    currentFlow: string;
    index: number;
    policyList: Policy[];
    selectedTab: number;
    fetchPolicies: () => void;
    DraggablePolicyCard: any;
}

const TabPanelShared: FC<TabPanelSharedProps> = ({
    selectedTab,
    index,
    currentFlow,
    policyList,
    fetchPolicies,
    DraggablePolicyCard
}) => {
    return (
        <div
            role='tabpanel'
            hidden={selectedTab !== index}
            id={`${currentFlow}-tabpanel`}
            aria-labelledby={`${currentFlow}-tab`}
        >
            <Box py={1} px={3}>
                {selectedTab === index &&
                    policyList?.map((singlePolicy: Policy) => {
                        return (
                            <DraggablePolicyCard
                                key={singlePolicy.id}
                                policyObj={singlePolicy}
                                showCopyIcon
                                isLocalToAPI={singlePolicy.isAPISpecific}
                                fetchPolicies={fetchPolicies}
                            />
                        );
                    })}
            </Box>
        </div>
    );
}

export default TabPanelShared;