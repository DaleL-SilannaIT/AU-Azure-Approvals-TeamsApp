import { query } from 'mssql';
import { ApprovalFilters, ApprovalUserFilters, ApprovalRequesterFilters } from './interfaces/filters';

export async function FilterQueryBuilder(filters: ApprovalFilters, object_id: string, userSecGrps: string[]): Promise<string> {
    console.log('Filters in query builder:', filters);

    const approvalUsersQuery = ApprovalUserHandler(filters.approvalUserFilters);
    console.log('Approval users query:', approvalUsersQuery);

    const userQuery = UserScopeHandler(object_id, userSecGrps);
    console.log('User query:', userQuery);

    const filterQuery = FilterHandler(userQuery, filters);
    console.log('Filter query:', filterQuery);

    const innerJoinQuery = InnerJoinHandler(filterQuery, approvalUsersQuery, filters);
    console.log('Constructed query inside FilterQueryBuilder:', innerJoinQuery);
    return innerJoinQuery;
}

function CastValue(value: string, value_type: 'number' | 'string' | 'boolean' | 'datetime' | 'number_array' | 'string_array'): any {
    // Cast the provided value (string) into a valid SQL value based on the value_type
    // Return undefined if the value cannot be cast
    switch (value_type) {
        case 'number':
            //console.log(11);
            return parseInt(value) === 1 ? parseInt(value) : undefined;
        case 'boolean':
            //console.log(22);
            return value.toLowerCase() === 'true' ? 1 : 0;
        case 'datetime':
            //console.log(33);
            // Perform checks to make sure the filter.value is in valid SQL format
            if (!/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(value)) {
                return undefined
            }
            return `'${value.split('.')[0]}'`;
        case 'string':
            //console.log(44);
            return value;
        case 'number_array':
            let parsedValue = undefined;
            try {
                parsedValue = JSON.parse(value);
            } catch (error) {
                console.log('Error parsing number array:', error);
            }

            return parsedValue
        case 'string_array':
            let parsedStringArray = undefined;
            try {
                parsedStringArray = JSON.parse(value);
            } catch (error) {
                console.log('Error parsing string array:', error);
            }

            return parsedStringArray;
        default:
            //console.log(55);
            return undefined;
    }
}

function UserScopeHandler(object_id: string, userSecGrps: string[]): string {
    //const groups = await fetchUserSecurityGroups(object_id);
    let userQuery = `SELECT 
            Approvals.id AS Approvals_id,
            Approvals.active AS Approvals_active,
            Approvals.title AS Approvals_title,
            Approvals.subject AS Approvals_subject,
            Approvals.body AS Approvals_body,
            Approvals.outcome AS Approvals_outcome,
            Approvals.outcome_colour AS Approvals_outcome_colour,
            Approvals.source_id AS Approvals_source_id,
            Approvals.entity_id AS Approvals_entity_id,
            Approvals.entity_name AS Approvals_entity_name,
            Approvals.entity_url AS Approvals_entity_url,
            Approvals.has_notes AS Approvals_has_notes,
            Approvals.has_attachments AS Approvals_has_attachments,
            Approvals.icon AS Approvals_icon,
            Approvals.created_datetime AS Approvals_created_datetime,
            Approvals.attachments AS Approvals_attachments
        FROM Approvals 
        INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
        INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id`;

    // add in logic here to check if a user is an admin, processor or normal user
    userQuery += ` WHERE Approval_Users.object_id = '${object_id}'`
    // if (groups.length > 0) {
    //     console.log('User belongs to security groups:', groups);
    //     const groupConditions = groups.map(groupId => `Approval_Users.group_id = '${groupId}'`).join(' OR ');
    //     baseQuery += ` WHERE Approval_Users.object_id = '${object_id}' OR (${groupConditions})`;
    // } else {
    //     baseQuery += ` WHERE Approval_Users.object_id = '${object_id}'`;
    // }

    return userQuery;
}

function ApprovalUserHandler(approvalUserFilters: ApprovalUserFilters): string {
    console.log('Approval User Filters:', approvalUserFilters);
    console.log('Approval User Filters:', approvalUserFilters.requestersFilters);
    console.log('Approval User Filters:', approvalUserFilters.requestersFilters.value);
    let approvalUsersQuery = '';
    let requesters;
    let approvers;
    let queryArray = [];

    try {
        //if (approvalUserFilters?.requestersFilters?.value != undefined) {
            console.log('JSON Requesters:', approvalUserFilters.requestersFilters.value);
            requesters = JSON.parse(approvalUserFilters.requestersFilters.value);
            console.log('JSON Requesters:', JSON.parse(approvalUserFilters.requestersFilters.value));
            
        //}

        //if (approvalUserFilters?.approversFilters?.value != undefined) {
            console.log('JSON Approvers:', approvalUserFilters.approversFilters.value);
            approvers = JSON.parse(approvalUserFilters.approversFilters.value);
            console.log('JSON Approvers:', JSON.parse(approvalUserFilters.approversFilters.value));
            
        //}
        
    } catch (error) {
        console.log('Error parsing requesters or approvers:', error);
        return '';
    }

    let requestersQuery = '';
    let firstRequester;
    let nthRequesters;

    if (requesters.length > 0) {
        firstRequester = requesters[0];
        console.log('First Requester:', firstRequester);
        nthRequesters = requesters.slice(1);

        requestersQuery = 
            `
            FirstApprovalGroup AS (
                SELECT 
                    Approvals.id AS Approvals_id,
                    MIN(Approval_Groups.id) AS FirstGroup_id
                FROM Approvals
                INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
                GROUP BY Approvals.id
            ),
            FilteredRequesters AS (
                SELECT 
                    Approvals.id AS Approvals_id,
                    Approvals.active AS Approvals_active,
                    Approvals.title AS Approvals_title,
                    Approvals.subject AS Approvals_subject,
                    CAST(Approvals.body AS varchar(max)) AS Approvals_body,
                    Approvals.outcome AS Approvals_outcome,
                    Approvals.outcome_colour AS Approvals_outcome_colour,
                    Approvals.source_id AS Approvals_source_id,
                    Approvals.entity_id AS Approvals_entity_id,
                    Approvals.entity_name AS Approvals_entity_name,
                    Approvals.entity_url AS Approvals_entity_url,
                    Approvals.has_notes AS Approvals_has_notes,
                    Approvals.has_attachments AS Approvals_has_attachments,
                    Approvals.icon AS Approvals_icon,
                    Approvals.created_datetime AS Approvals_created_datetime,
                    CAST(Approvals.attachments AS varchar(max)) AS Approvals_attachments
                FROM Approvals
                INNER JOIN FirstApprovalGroup ON Approvals.id = FirstApprovalGroup.Approvals_id
                INNER JOIN Approval_Groups ON FirstApprovalGroup.FirstGroup_id = Approval_Groups.id
                INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
                WHERE Approval_Users.object_id = '${firstRequester}' 
                `;

        nthRequesters.forEach((nRequester: any) => {
            requestersQuery += ` 
            ${approvalUserFilters.requestersFilters.join_operator} EXISTS (
                SELECT 1
                FROM ${approvalUserFilters.requestersFilters.tableName} AU
                WHERE AU.group_id = Approval_Groups.id
                AND AU.${approvalUserFilters.requestersFilters.columnName} = '${nRequester}'
            )`;
        });

        requestersQuery += `)`;

        queryArray.push(requestersQuery);
    }

    let approversBaseQuery = '';
    if (approvers.length > 0) {
        let approversQueryArr = [];
        let approversQuery = '';

        approvers.forEach(approver => {
            approversQueryArr.push(` 
            EXISTS (
                SELECT 1
                FROM ${approvalUserFilters.approversFilters.tableName} AU
                WHERE AU.group_id = Approval_Groups.id
                AND AU.${approvalUserFilters.approversFilters.columnName} = '${approver}'
            )`);

            approversQuery = approversQueryArr.join(` ${approvalUserFilters.approversFilters.join_operator} `);
        });

        approversBaseQuery =
            `
            FilteredApprovers AS (
                SELECT 
                    Approvals.id AS Approvals_id
                FROM Approvals
                INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
                INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
                WHERE Approval_Groups.id > (
                    SELECT MIN(Approval_Groups.id)
                    FROM Approval_Groups
                    WHERE Approval_Groups.approval_id = Approvals.id
                ) AND (${approversQuery})
            )
            `;

        queryArray.push(approversBaseQuery);
    }
    if (queryArray.length > 0) {
        approvalUsersQuery += 'WITH ';
    }
    approvalUsersQuery += queryArray.join(', ');

    return approvalUsersQuery;
}

function FilterHandler(userQuery: string, filters: ApprovalFilters): string {
    let tableName = 'Approvals';
    //let filterQuery = `SELECT * FROM (${userQuery}) AS ${tableName}`
    let filterQuery = `${userQuery}`
    let whereClauses: string[] = [];

    Object.keys(filters).forEach(key => {
        if (Array.isArray(filters[key])) {
            for (const filter of filters[key]) {
                if (!tableName || !filter.columnName || !filter.tableName) {
                    console.log('Invalid filter:', filter);
                    continue;
                }

                let filterValue = CastValue(filter.value, filter.value_type);
                if (filter.value_type === 'datetime') {
                    filterValue = `'${filter.value.split('.')[0]}'`;
                } else if (filter.value_type === 'number_array' || filter.value_type === 'string_array') {
                    if (Array.isArray(filterValue)) {
                        let initialClause = `(`;
                        let clauseConditions = [];
                        filterValue.forEach((value: string, index: number) => {
                            if (filter.value_type === 'string_array') {
                                clauseConditions.push(`${filter.tableName}.${filter.columnName} ${filter.operator} '${value}'`);
                            } else {
                                clauseConditions.push(`${filter.tableName}.${filter.columnName} ${filter.operator} ${value}`);
                            }
                        });
                        let clauseQuery = clauseConditions.join(` ${filter.join_operator} `);
                        let finalClause = `${initialClause}${clauseQuery})`;
                        filterValue = finalClause;
                    } else {
                        continue;
                    }
                } else {
                    filterValue = filter.value;
                }

                // if (filterValue === undefined || filter.value === undefined) {
                //     console.log('Invalid filter value:', filter);
                //     continue;
                // }

                if (filter.value_type === 'number_array') {
                    whereClauses.push(filterValue);
                } else {
                    whereClauses.push(`${filter.tableName}.${filter.columnName} ${filter.operator} ${filterValue}`);
                }

            }

            if (whereClauses.length > 0) {
                filterQuery += ' AND ' + whereClauses.join(' AND ');
            }

            whereClauses = [];
        }
    });
    if (JSON.parse(filters.approvalUserFilters.requestersFilters.value).length > 0) {
        filterQuery += 
        ` AND Approvals.id IN (
            SELECT Approvals_id
            FROM FilteredRequesters
        )`
    }
    
    if (JSON.parse(filters.approvalUserFilters.approversFilters.value).length > 0) {
        filterQuery += 
        ` AND Approvals.id IN (
            SELECT Approvals_id
            FROM FilteredApprovers
        )`
    }
    filterQuery +=
        ` ORDER BY ${tableName}.id ASC
    OFFSET ${filters.skipCount} ROWS 
    FETCH NEXT ${filters.topCount} ROWS ONLY`;

    return filterQuery;
}

function InnerJoinHandler(filterQuery: string, approvalUsersQuery: string, filters: ApprovalFilters): string {
    const tableName = 'TopApprovals';
    let innerJoinQuery = '';
    let orderByQuery = '';

    if (filters.sortField === "Approvals_id") {
        orderByQuery = `ORDER BY ${filters.sortField} ${filters.sortOrder}`;
    } else {
        orderByQuery = `ORDER BY ${filters.sortField} ${filters.sortOrder}, Approvals_id DESC`;
    }

    if (JSON.parse(filters.approvalUserFilters.requestersFilters.value).length > 0 || JSON.parse(filters.approvalUserFilters.approversFilters.value).length > 0) {
        innerJoinQuery += approvalUsersQuery;
    }
    
    innerJoinQuery +=
        `SELECT 
        ${tableName}.Approvals_id,
        ${tableName}.Approvals_active,
        ${tableName}.Approvals_title,
        ${tableName}.Approvals_subject,
        ${tableName}.Approvals_body,
        ${tableName}.Approvals_outcome,
        ${tableName}.Approvals_outcome_colour,
        ${tableName}.Approvals_source_id,
        ${tableName}.Approvals_entity_id,
        ${tableName}.Approvals_entity_name,
        ${tableName}.Approvals_entity_url,
        ${tableName}.Approvals_has_notes,
        ${tableName}.Approvals_has_attachments,
        ${tableName}.Approvals_icon,
        ${tableName}.Approvals_created_datetime,
        ${tableName}.Approvals_attachments,
        Approval_Groups.id AS Approval_Groups_id,
        Approval_Groups.title AS Approval_Groups_title,
        Approval_Users.id AS Approval_Users_id,
        Approval_Users.object_id AS Approval_Users_Object_id,
        Approval_Users.upn AS Approval_Users_upn,
        Approval_Users.email AS Approval_Users_email,
        Approval_Users.display_name AS Approval_Users_display_name,
        Approval_Users.substitute_for AS Approval_Users_substitute_for,
        Approval_Users.response AS Approval_Users_response,
        Approval_Users.notes AS Approval_Users_notes,
        Approval_Users.actionable AS Approval_Users_actionable,
        Approval_Users.time_zone_offset AS Approval_Users_time_zone_offset,
        Approval_Users.reminder_count AS Approval_Users_reminder_count,
        Approval_Users.response_datetime AS Approval_Users_response_datetime,
        Approval_Users.object_id AS Approval_Users_object_id,
        Child_Approval_Sources.display_name AS Child_Approval_Source_display_name
    FROM (${filterQuery}) AS ${tableName}
    INNER JOIN Approval_Groups ON TopApprovals.Approvals_id = Approval_Groups.approval_id
    INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
    INNER JOIN child_approval_sources ON TopApprovals.Approvals_source_id = child_approval_sources.id
    ${orderByQuery};`;

    return innerJoinQuery;
}

/*

    Example query

WITH FirstApprovalGroup AS (
    SELECT 
        Approvals.id AS Approvals_id,
        MIN(Approval_Groups.id) AS FirstGroup_id
    FROM Approvals
    INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
    GROUP BY Approvals.id
),
FilteredRequesters AS (
    SELECT 
        Approvals.id AS Approvals_id,
        Approvals.active AS Approvals_active,
        Approvals.title AS Approvals_title,
        Approvals.subject AS Approvals_subject,
        CAST(Approvals.body AS varchar(max)) AS Approvals_body,
        Approvals.outcome AS Approvals_outcome,
        Approvals.outcome_colour AS Approvals_outcome_colour,
        Approvals.source_id AS Approvals_source_id,
        Approvals.entity_id AS Approvals_entity_id,
        Approvals.entity_name AS Approvals_entity_name,
        Approvals.entity_url AS Approvals_entity_url,
        Approvals.has_notes AS Approvals_has_notes,
        Approvals.has_attachments AS Approvals_has_attachments,
        Approvals.icon AS Approvals_icon,
        Approvals.created_datetime AS Approvals_created_datetime,
        CAST(Approvals.attachments AS varchar(max)) AS Approvals_attachments
    FROM Approvals
    INNER JOIN FirstApprovalGroup ON Approvals.id = FirstApprovalGroup.Approvals_id
    INNER JOIN Approval_Groups ON FirstApprovalGroup.FirstGroup_id = Approval_Groups.id
    INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
    WHERE Approval_Users.upn = 'navn@silanna.com'
    AND EXISTS (
        SELECT 1
        FROM Approval_Users AU
        WHERE AU.group_id = Approval_Groups.id
        AND AU.upn = 'dalel@silanna.com'
    )
    -- Add more EXISTS clauses here for additional requesters as needed
),
FilteredApprovers AS (
    SELECT 
        Approvals.id AS Approvals_id
    FROM Approvals
    INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
    INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
    WHERE Approval_Groups.id > (
        SELECT MIN(Approval_Groups.id)
        FROM Approval_Groups
        WHERE Approval_Groups.approval_id = Approvals.id
    )
    AND (
        EXISTS (
            SELECT 1
            FROM Approval_Users AU
            WHERE AU.group_id = Approval_Groups.id
            AND AU.upn = 'au-itdev06@silanna.com'
        )
        AND EXISTS (
            SELECT 1
            FROM Approval_Users AU
            WHERE AU.group_id = Approval_Groups.id
            AND AU.upn = 'au-itdev07@silanna.com'
        )
        -- Add more EXISTS clauses here for additional approvers as needed
    )
)
SELECT 
    TopApprovals.Approvals_id,
    TopApprovals.Approvals_active,
    TopApprovals.Approvals_title,
    TopApprovals.Approvals_subject,
    TopApprovals.Approvals_body,
    TopApprovals.Approvals_outcome,
    TopApprovals.Approvals_outcome_colour,
    TopApprovals.Approvals_source_id,
    TopApprovals.Approvals_entity_id,
    TopApprovals.Approvals_entity_name,
    TopApprovals.Approvals_entity_url,
    TopApprovals.Approvals_has_notes,
    TopApprovals.Approvals_has_attachments,
    TopApprovals.Approvals_icon,
    TopApprovals.Approvals_created_datetime,
    TopApprovals.Approvals_attachments,
    Approval_Groups.id AS Approval_Groups_id,
    Approval_Groups.title AS Approval_Groups_title,
    Approval_Users.id AS Approval_Users_id,
    Approval_Users.object_id AS Approval_Users_Object_id,
    Approval_Users.upn AS Approval_Users_upn,
    Approval_Users.email AS Approval_Users_email,
    Approval_Users.display_name AS Approval_Users_display_name,
    Approval_Users.substitute_for AS Approval_Users_substitute_for,
    Approval_Users.response AS Approval_Users_response,
    Approval_Users.notes AS Approval_Users_notes,
    Approval_Users.actionable AS Approval_Users_actionable,
    Approval_Users.time_zone_offset AS Approval_Users_time_zone_offset,
    Approval_Users.reminder_count AS Approval_Users_reminder_count,
    Approval_Users.response_datetime AS Approval_Users_response_datetime
FROM (
    SELECT 
        Approvals.id AS Approvals_id,
        Approvals.active AS Approvals_active,
        Approvals.title AS Approvals_title,
        Approvals.subject AS Approvals_subject,
        CAST(Approvals.body AS varchar(max)) AS Approvals_body,
        Approvals.outcome AS Approvals_outcome,
        Approvals.outcome_colour AS Approvals_outcome_colour,
        Approvals.source_id AS Approvals_source_id,
        Approvals.entity_id AS Approvals_entity_id,
        Approvals.entity_name AS Approvals_entity_name,
        Approvals.entity_url AS Approvals_entity_url,
        Approvals.has_notes AS Approvals_has_notes,
        Approvals.has_attachments AS Approvals_has_attachments,
        Approvals.icon AS Approvals_icon,
        Approvals.created_datetime AS Approvals_created_datetime,
        CAST(Approvals.attachments AS varchar(max)) AS Approvals_attachments
    FROM Approvals 
    INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
    INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id 
    WHERE Approval_Users.upn = 'dalel@silanna.com'
    AND (Approvals.source_id = 9 OR Approvals.source_id = 5 OR Approvals.source_id = 18)
    AND Approvals.id IN (
        SELECT Approvals_id
        FROM FilteredRequesters
    )
    AND Approvals.id IN (
        SELECT Approvals_id
        FROM FilteredApprovers
    )
    ORDER BY Approvals.id
    OFFSET 0 ROWS 
    FETCH NEXT 100 ROWS ONLY
) AS TopApprovals
INNER JOIN Approval_Groups ON TopApprovals.Approvals_id = Approval_Groups.approval_id
INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id

*/