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

import {
    Kind,
    getNamedType,
    isCompositeType,
    SchemaMetaFieldDef,
    TypeMetaFieldDef,
    TypeNameMetaFieldDef,
} from 'graphql';

const DEFAULT_FIELD_COMPLEXITY = 1;

// Arguments that multiply the complexity of a field by their value. Must be kept in sync with
// GraphQLConstants.QUERY_COMPLEXITY_SLICING_ARGS in the gateway (carbon-apimgt).
const SLICING_ARGUMENTS = ['first', 'last', 'limit'];

/**
 * Builds a lookup map of custom complexity values keyed by `${type}.${field}`.
 * @param {Array<{type: string, field: string, complexityValue: number}>} complexityList complexity values of the API
 * @returns {Object<string, number>} complexity value map
 */
export function buildComplexityMap(complexityList) {
    const complexityMap = {};
    (complexityList || []).forEach((item) => {
        complexityMap[`${item.type}.${item.field}`] = item.complexityValue;
    });
    return complexityMap;
}

/**
 * Resolves the field definition of a selected field, including the introspection meta fields.
 * @param {GraphQLSchema} schema GraphQL schema
 * @param {GraphQLCompositeType} parentType type the field is selected on
 * @param {string} fieldName name of the field
 * @returns {GraphQLField|undefined} field definition
 */
function getFieldDef(schema, parentType, fieldName) {
    if (fieldName === TypeNameMetaFieldDef.name) {
        return TypeNameMetaFieldDef;
    }
    if (parentType === schema.getQueryType()) {
        if (fieldName === SchemaMetaFieldDef.name) {
            return SchemaMetaFieldDef;
        }
        if (fieldName === TypeMetaFieldDef.name) {
            return TypeMetaFieldDef;
        }
    }
    return typeof parentType.getFields === 'function' ? parentType.getFields()[fieldName] : undefined;
}

/**
 * Calculates the arguments multiplier of a field the same way the gateway does.
 * Slicing arguments add their integer value, other arguments add 1, and no arguments gives 1.
 * @param {Array<ArgumentNode>} argumentNodes arguments of the field
 * @returns {number} arguments multiplier
 */
function getArgumentsValue(argumentNodes) {
    if (!argumentNodes || argumentNodes.length === 0) {
        return 1;
    }
    return argumentNodes.reduce((total, argument) => {
        if (SLICING_ARGUMENTS.includes(argument.name.value.toLowerCase())) {
            // Only literal integers are counted, values passed as variables count as 0 in the gateway.
            return total + (argument.value.kind === Kind.INT ? parseInt(argument.value.value, 10) : 0);
        }
        return total + 1;
    }, 0);
}

/**
 * Recursively calculates the complexity of a selection set.
 * @param {SelectionSetNode} selectionSet selection set to calculate
 * @param {GraphQLCompositeType} parentType type the selection set is applied on
 * @param {Object} context schema, complexity map, fragments and the fragments visited in the current path
 * @returns {number} complexity of the selection set
 */
function getSelectionSetComplexity(selectionSet, parentType, context) {
    if (!selectionSet || !parentType) {
        return 0;
    }
    const { schema, complexityMap, fragments } = context;
    return selectionSet.selections.reduce((total, selection) => {
        switch (selection.kind) {
            case Kind.FIELD: {
                const fieldName = selection.name.value;
                const fieldDef = getFieldDef(schema, parentType, fieldName);
                if (!fieldDef) {
                    return total;
                }
                const fieldType = getNamedType(fieldDef.type);
                const childComplexity = isCompositeType(fieldType)
                    ? getSelectionSetComplexity(selection.selectionSet, fieldType, context)
                    : 0;
                const customComplexity = complexityMap[`${parentType.name}.${fieldName}`]
                    ?? DEFAULT_FIELD_COMPLEXITY;
                return total + (getArgumentsValue(selection.arguments) * (customComplexity + childComplexity));
            }
            case Kind.INLINE_FRAGMENT: {
                const fragmentType = selection.typeCondition
                    ? schema.getType(selection.typeCondition.name.value)
                    : parentType;
                return total + getSelectionSetComplexity(selection.selectionSet, fragmentType, context);
            }
            case Kind.FRAGMENT_SPREAD: {
                const fragmentName = selection.name.value;
                const fragment = fragments[fragmentName];
                // Skip unknown fragments and fragment cycles, which are invalid queries anyway.
                if (!fragment || context.visitedFragments.has(fragmentName)) {
                    return total;
                }
                const fragmentContext = {
                    ...context,
                    visitedFragments: new Set(context.visitedFragments).add(fragmentName),
                };
                return total + getSelectionSetComplexity(
                    fragment.selectionSet,
                    schema.getType(fragment.typeCondition.name.value),
                    fragmentContext,
                );
            }
            default:
                return total;
        }
    }, 0);
}

/**
 * Calculates the total complexity of the selected operation in a GraphQL document, using the same
 * formula as the gateway: argumentsValue * (customFieldComplexity + childComplexity) for each field.
 * @param {GraphQLSchema} schema GraphQL schema of the API
 * @param {DocumentNode} documentAST parsed GraphQL document
 * @param {string} operationName name of the selected operation
 * @param {Object<string, number>} complexityMap custom complexity values from buildComplexityMap
 * @returns {number|null} total complexity, or null if there is no operation to calculate
 */
export function calculateQueryComplexity(schema, documentAST, operationName, complexityMap) {
    if (!schema || !documentAST) {
        return null;
    }
    const operations = documentAST.definitions.filter((def) => def.kind === Kind.OPERATION_DEFINITION);
    const operation = operations.find((op) => op.name && op.name.value === operationName) || operations[0];
    if (!operation) {
        return null;
    }
    const rootTypes = {
        query: schema.getQueryType(),
        mutation: schema.getMutationType(),
        subscription: schema.getSubscriptionType(),
    };
    const fragments = {};
    documentAST.definitions
        .filter((def) => def.kind === Kind.FRAGMENT_DEFINITION)
        .forEach((def) => {
            fragments[def.name.value] = def;
        });
    return getSelectionSetComplexity(operation.selectionSet, rootTypes[operation.operation], {
        schema,
        complexityMap: complexityMap || {},
        fragments,
        visitedFragments: new Set(),
    });
}
