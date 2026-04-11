/*
 * Copyright (c) 2026 WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

const COLOR_KEYWORD = '#fff';
const COLOR_STRING = '#89d185';
const COLOR_OTHER = '#cfd8dc';

/**
 * Shell single-quoted segment starting at start (must point at opening ').
 */
function consumeShellSingleQuoted(str, start) {
    if (str[start] !== "'") {
        return { text: '', end: start };
    }
    let j = start + 1;
    let acc = "'";
    while (j < str.length) {
        if (str[j] === "'" && str[j + 1] === '\\' && str[j + 2] === "'") {
            acc += "'\\''";
            j += 3;
        } else if (str[j] === "'") {
            acc += "'";
            j += 1;
            return { text: acc, end: j };
        } else {
            acc += str[j];
            j += 1;
        }
    }
    return { text: acc, end: j };
}

function tokenizeCurlLine(line) {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
        const rem = line.slice(i);
        const mSpace = /^(\s+)/.exec(rem);
        if (mSpace) {
            tokens.push({ type: 'other', value: mSpace[1] });
            i += mSpace[1].length;
        } else {
            const mKw = /^(curl|-X|-H|-d)(?=\s|'|$|\\)/.exec(rem);
            if (mKw) {
                tokens.push({ type: 'kw', value: mKw[1] });
                i += mKw[1].length;
            } else if (line[i] === "'") {
                const quoted = consumeShellSingleQuoted(line, i);
                tokens.push({ type: 'str', value: quoted.text });
                i = quoted.end;
            } else {
                tokens.push({ type: 'other', value: line[i] });
                i += 1;
            }
        }
    }
    return tokens;
}

/**
 * Swagger-like curl highlighting: flags white, quoted strings green.
 */
export default function CurlHighlightedPre({ text, style, className }) {
    const lines = text.split('\n');
    let keySeq = 0;
    const nextKey = (prefix) => {
        keySeq += 1;
        return `${prefix}-${keySeq}`;
    };
    return (
        <pre className={className} style={style}>
            {lines.map((line) => (
                <span key={nextKey('line')} style={{ display: 'block' }}>
                    {tokenizeCurlLine(line).map((tok) => {
                        const key = nextKey('tok');
                        if (tok.type === 'kw') {
                            return <span key={key} style={{ color: COLOR_KEYWORD }}>{tok.value}</span>;
                        }
                        if (tok.type === 'str') {
                            return <span key={key} style={{ color: COLOR_STRING }}>{tok.value}</span>;
                        }
                        return <span key={key} style={{ color: COLOR_OTHER }}>{tok.value}</span>;
                    })}
                </span>
            ))}
        </pre>
    );
}
