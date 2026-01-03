import { Department, SubDepartment } from '../types';

export type OrgTreeItem =
    | { type: 'department'; data: Department; depth: number; isExpanded: boolean }
    | { type: 'subDepartment'; data: SubDepartment; depth: number }
    | { type: 'empty'; parentId: string; depth: number };

/**
 * Flattens the Department/SubDepartment structure into a linear list
 * based on the current expanded state.
 * 
 * @param departments Root departments
 * @param subDepartments All sub-departments
 * @param expandedIds Set of expanded department IDs
 */
export const flattenDepartments = (
    departments: Department[],
    subDepartments: SubDepartment[],
    expandedIds: Set<string>
): OrgTreeItem[] => {
    const flatList: OrgTreeItem[] = [];

    // 1. Map sub-departments by parentID for O(1) lookup
    const subDeptMap = new Map<string, SubDepartment[]>();
    subDepartments.forEach(sub => {
        const parentId = sub.parentDepartmentId;
        if (parentId) {
            if (!subDeptMap.has(parentId)) {
                subDeptMap.set(parentId, []);
            }
            subDeptMap.get(parentId)!.push(sub);
        }
    });

    // 2. Iterate through departments to build flat list
    departments.forEach(dept => {
        const isExpanded = expandedIds.has(dept.id);
        flatList.push({
            type: 'department',
            data: dept,
            depth: 0,
            isExpanded
        });

        // If expanded, add children immediately after parent
        if (isExpanded) {
            const children = subDeptMap.get(dept.id) || [];

            if (children.length === 0) {
                flatList.push({
                    type: 'empty',
                    parentId: dept.id,
                    depth: 1
                });
            } else {
                children.forEach(sub => {
                    flatList.push({
                        type: 'subDepartment',
                        data: sub,
                        depth: 1
                    });
                });
            }
        }
    });

    return flatList;
};
