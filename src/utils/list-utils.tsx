export const applyPagination = (entities, page, rowPerPage) => entities.slice(page * rowPerPage, page * rowPerPage + rowPerPage);

// takes in object mapping keys to functions ( (entity, filterParam) -> Boolean )
// returns a function ( (entity array, object mapping key to filterParam) )
// returns entity that passes all filters
export const createFilter = (filterFunctions) => (entities, filterParams) => {
    const filterEntries = Object.entries(filterParams);
    return entities.filter(
        entity => filterEntries.every(
            (filterArray) => {
                const filterFunction = filterFunctions[filterArray[0]];
                return filterFunction && filterFunction(entity, filterArray[1]);
            }
        )
    );
};
