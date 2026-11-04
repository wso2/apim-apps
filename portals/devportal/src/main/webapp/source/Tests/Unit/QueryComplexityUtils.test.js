/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import { buildSchema, parse } from 'graphql';
import {
    buildComplexityMap,
    calculateQueryComplexity,
} from 'AppComponents/Apis/Details/GraphQLConsole/QueryComplexityUtils';

const schema = buildSchema(`
    type Query {
        hero: Character
        heroes(first: Int, filter: String): [Character]
        human(id: ID!): Human
    }
    type Mutation {
        createReview(stars: Int): Review
    }
    interface Character {
        id: ID
        name: String
        friends: [Character]
    }
    type Human implements Character {
        id: ID
        name: String
        friends: [Character]
        height: Float
    }
    type Review {
        stars: Int
    }
`);

const complexityMap = buildComplexityMap([
    { type: 'Query', field: 'hero', complexityValue: 2 },
    { type: 'Character', field: 'friends', complexityValue: 5 },
    { type: 'Human', field: 'height', complexityValue: 3 },
]);

const calculate = (query, operationName) => calculateQueryComplexity(
    schema, parse(query), operationName, complexityMap,
);

describe('buildComplexityMap', () => {
    test('builds a map keyed by type and field', () => {
        expect(complexityMap).toEqual({ 'Query.hero': 2, 'Character.friends': 5, 'Human.height': 3 });
    });

    test('returns an empty map when there are no complexity values', () => {
        expect(buildComplexityMap(null)).toEqual({});
    });
});

describe('calculateQueryComplexity', () => {
    test('returns null when there is no schema, document or operation', () => {
        expect(calculateQueryComplexity(null, parse('{ hero { id } }'), null, complexityMap)).toBeNull();
        expect(calculateQueryComplexity(schema, null, null, complexityMap)).toBeNull();
        expect(calculateQueryComplexity(schema, parse('fragment F on Human { id }'), null, complexityMap))
            .toBeNull();
    });

    test('adds custom and default field complexities with child complexity', () => {
        // hero: 2 + (id 1 + name 1) = 4
        expect(calculate('{ hero { id name } }')).toBe(4);
        // hero: 2 + (friends: 5 + (name 1)) = 8
        expect(calculate('{ hero { friends { name } } }')).toBe(8);
    });

    test('multiplies by slicing arguments and counts other arguments as 1', () => {
        // heroes: first 10 * (1 + id 1) = 20
        expect(calculate('{ heroes(first: 10) { id } }')).toBe(20);
        // heroes: (first 10 + filter 1) * (1 + id 1) = 22
        expect(calculate('{ heroes(first: 10, filter: "a") { id } }')).toBe(22);
        // human: id argument 1 * (1 + name 1) = 2
        expect(calculate('{ human(id: "1") { name } }')).toBe(2);
        // slicing argument passed as a variable counts as 0, same as the gateway
        expect(calculate('query Q($n: Int) { heroes(first: $n) { id } }')).toBe(0);
    });

    test('resolves inline fragments and fragment spreads', () => {
        // hero: 2 + (name 1 + height 3) = 6
        expect(calculate('{ hero { name ... on Human { height } } }')).toBe(6);
        expect(calculate('{ hero { ...HumanFields } } fragment HumanFields on Human { name height }')).toBe(6);
    });

    test('ignores fragment cycles', () => {
        const query = '{ hero { ...A } } fragment A on Character { id ...B } fragment B on Character { name ...A }';
        // hero: 2 + (id 1 + name 1) = 4
        expect(calculate(query)).toBe(4);
    });

    test('calculates only the selected operation', () => {
        const query = 'query Small { hero { id } } mutation Review { createReview(stars: 5) { stars } }';
        // hero: 2 + (id 1) = 3
        expect(calculate(query, 'Small')).toBe(3);
        // createReview: stars argument 1 * (1 + stars 1) = 2
        expect(calculate(query, 'Review')).toBe(2);
        // falls back to the first operation when no operation is selected
        expect(calculate(query, null)).toBe(3);
    });
});
