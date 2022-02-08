/* eslint-disable no-mixed-operators */
/* eslint-disable eqeqeq */
/* eslint-disable no-bitwise */
export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0; const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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