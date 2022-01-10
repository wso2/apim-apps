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
import { StackFrame } from 'error-stack-parser';

import { isFilenameAbsolute, makeUrl, makeLinkText } from './utils';
import useStyles from './styles';

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
    const classes = useStyles();
    if (!frames) {
        return null;
    }
    return (
        <>
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
        </>
    );
}
