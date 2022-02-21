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

export const hasModifiedAbstract = (item, educationWithoutChanges) => {
    if (educationWithoutChanges) {
        const itemToCheck = educationWithoutChanges.filter((ed) => ed.id === item.id);
        if (itemToCheck.length === 0) { // It's a new entry
            return true;
        } else {
            // Filtering for not changed items.
            const changedKeys = Object.keys(itemToCheck[0]).filter(key => {
                const checkingItem = itemToCheck[0][key];
                if (typeof checkingItem === "object") {
                    if (checkingItem.getMonth) {
                        return (checkingItem.getTime() !== item[key].getTime());
                    }
                    if (checkingItem.value) {
                        return (checkingItem.value !== item[key].value);
                    }
                }
                return (checkingItem !== item[key]);
            });
            return changedKeys.length > 0;
        }
    } else {
        return false;
    }
}

export { hasModifiedAbstract as default }
