/* eslint-disable react/require-default-props */ // Not required since typescript 
/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import React from 'react';
import { styled } from '@mui/material/styles';
import StackFrame from 'stackframe';

import { isFilenameAbsolute, makeUrl, makeLinkText } from './utils';

const PREFIX = 'StackTraceFrame';

const classes = {
    mainStack: `${PREFIX}-mainStack`,
    message: `${PREFIX}-message`,
    stack: `${PREFIX}-stack`,
    frame: `${PREFIX}-frame`,
    file: `${PREFIX}-file`,
    linkToFile: `${PREFIX}-linkToFile`
};


const Root = styled('div')(() => ({
    [`& .${classes.mainStack}`]: {
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        padding: 10,
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px',
        width: '100%',
        background: '#0b1332',
        color: 'white',
        textAlign: 'left',
        fontSize: '16px',
        lineHeight: 1.2,
        overflow: 'auto',
    },

    [`& .${classes.message}`]: {
        fontWeight: 'bold',
    },

    [`& .${classes.stack}`]: {
        fontFamily: 'monospace',
        marginTop: '2em',
    },

    [`& .${classes.frame}`]: {
        marginTop: '1em',
    },

    [`& .${classes.file}`]: {
        fontSize: '0.8em',
        color: 'rgba(255, 255, 255, 0.7)',
    },

    [`& .${classes.linkToFile}`]: {
        textDecoration: 'none',
        color: 'rgba(255, 255, 255, 0.7)',
    }
}));

type StackTraceFrameProps = {
    useLines: boolean;
    useColumns: boolean;
    frames?: StackFrame[];
    filename?: string;
    editorScheme?: any;
};
/**
 *
 * @param props
 * @returns
 */
export default function StackTraceFrame(props: StackTraceFrameProps) {
    const { filename, editorScheme, useLines, useColumns, frames = [] } = props;

    if (!frames) {
        return null;
    }
    return (
        (<Root>
            {frames.map((f, index: number) => {
                let text;
                let url;

                if (
                    index === 0 &&
                    filename &&
                    !isFilenameAbsolute(f.fileName)
                ) {
                    url = makeUrl(filename, editorScheme);
                    text = makeLinkText(filename);
                } else {
                    const lines = useLines ? f.lineNumber : null;
                    const columns = useColumns ? f.columnNumber : null;
                    url = makeUrl(f.fileName, editorScheme, lines, columns);
                    text = makeLinkText(f.fileName, lines, columns);
                }

                return (
                    <div key={f.functionName} className={classes.frame}>
                        <div>{f.functionName}</div>
                        <div className={classes.file}>
                            <a href={url} className={classes.linkToFile}>
                                {text}
                            </a>
                        </div>
                    </div>
                );
            })}
        </Root>)
    );
}
