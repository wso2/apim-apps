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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import ErrorStackParser from 'error-stack-parser';
import { mapStackTrace } from 'sourcemapped-stacktrace';
import StackTraceFrame from './StackTraceFrame';

const PREFIX = 'HumanizedStackTrace';

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

    [`&.${classes.frame}`]: {
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

type HumanizedStackTraceProps = {
    error: Error;
};

/**
 *
 * @param props
 * @returns
 */
export default function HumanizedStackTrace(props: HumanizedStackTraceProps) {
    const { error } = props;

    const [mappedError, setMappedError] = useState<Error | null>(null);
    useEffect(() => {
        const stackLines = error.stack?.split('\n');
        if (stackLines) {
            // There's no stack, only the error message.
            if (stackLines?.length < 2) {
                setMappedError(error);
                return;
            }

            // Using the “eval” setting on webpack already gives the correct location.
            const isWebpackEval =
                stackLines[1].search(/\(webpack:\/{3}/) !== -1;
            if (isWebpackEval) {
                // No changes are needed here.
                setMappedError(error);
                return;
            }

            // Other eval follow a specific pattern and can be easily parsed.
            const isEval = stackLines[1].search(/\(eval at/) !== -1;
            if (!isEval) {
                //     // mapping will be deferred until `componentDidMount`
                //     this.state = { error, mapped: false };
                mapStackTrace(error.stack, (mappedStack) => {
                    error.stack = mappedStack.join('\n');
                    setMappedError(error);
                });
                return;
            }

            // The first line is the error message.
            const fixedLines = [stackLines.shift()];
            // The rest needs to be fixed.
            for (const stackLine of stackLines) {
                const evalStackLine = stackLine.match(
                    /(.+)\(eval at (.+) \(.+?\), .+(:[0-9]+:[0-9]+)\)/,
                );
                if (evalStackLine) {
                    const [, atSomething, file, rowColumn] = evalStackLine;
                    fixedLines.push(`${atSomething} (${file}${rowColumn})`);
                } else {
                    // TODO: When stack frames of different types are detected, try to load the additional source maps
                    fixedLines.push(stackLine);
                }
            }
            error.stack = fixedLines.join('\n');
            setMappedError(error);
        }
    }, [error]);

    let frames;
    let parseError;
    try {
        frames = ErrorStackParser.parse(mappedError|| new Error("Unknown Error"));
    } catch (e) {
        parseError = new Error(
            'Failed to parse stack trace. Stack trace information unavailable.',
        );
    }

    if (parseError) {
        frames = (
            <Root className={classes.frame} key={0}>
                <div>{parseError.message}</div>
            </Root>
        );
    } else {
        frames = <StackTraceFrame useColumns useLines frames={frames} />;
    }

    return (
        <div className={classes.mainStack}>
            <div className={classes.message}>
                {mappedError?.name}: {mappedError?.message}
            </div>
            <div className={classes.stack}>{frames}</div>
        </div>
    );
}
