import { ApprovalFilters } from './interfaces/filters';

export async function FilterQueryBuilder(filters: ApprovalFilters, userUPN: string, userSecGrps: string[]): Promise<string> {
    const userQuery = UserScopeHandler(userUPN, userSecGrps);
    const filterQuery = FilterHandler(userQuery, filters);
    const innerJoinQuery = InnerJoinHandler(filterQuery);

    //console.log('Filters in query builder:', filters);
    //console.log('Constructed query inside FilterQueryBuilder:', innerJoinQuery);
    return innerJoinQuery;
}

function CastValue(value: string, value_type: 'number' | 'string' | 'boolean' | 'datetime'): any {
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
        default:
            //console.log(55);
            return undefined;
    }
}

function UserScopeHandler(userUPN: string, userSecGrps: string[]): string {
    //const groups = await fetchUserSecurityGroups(userUPN);
    let userQuery = `SELECT 
            Approvals.id AS Approvals_id,
            Approvals.active AS Approvals_active,
            Approvals.title AS Approvals_title,
            Approvals.subject AS Approvals_subject,
            Approvals.body AS Approvals_body,
            Approvals.outcome AS Approvals_outcome,
            Approvals.outcome_colour AS Approvals_outcome_colour,
            Approvals.parent_source AS Approvals_parent_source,
            Approvals.child_source AS Approvals_child_source,
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
        userQuery += ` WHERE Approval_Users.upn = '${userUPN}'`
    // if (groups.length > 0) {
    //     console.log('User belongs to security groups:', groups);
    //     const groupConditions = groups.map(groupId => `Approval_Users.group_id = '${groupId}'`).join(' OR ');
    //     baseQuery += ` WHERE Approval_Users.upn = '${userUPN}' OR (${groupConditions})`;
    // } else {
    //     baseQuery += ` WHERE Approval_Users.upn = '${userUPN}'`;
    // }

    return userQuery;
}

function FilterHandler(userQuery: string, filters: ApprovalFilters): string {
    let tableName = 'Approvals';
    let filterQuery = 
    `SELECT * FROM (${userQuery}) AS ${tableName}`
    //console.log('recieved filters:', filters);
    //parese filters here and append them to query string
    let whereClauses: string[] = [];
    //console.log(1)
    //Loop through all keys in the filter object that are of type array and concatenate the filters the filter objects inside each array to form the filter query
    Object.keys(filters).forEach(key => {
        //console.log(2)
        // filters out non array keys (e.g. sortField, sortOrder, topCount, skipCount)
        if (Array.isArray(filters[key])) {
            //console.log(3)
            // Loop through each filter object and append the filter to the query
            for (const filter of filters[key]) {
                //console.log(4, filter)
                let filterValue = CastValue(filter.value, filter.value_type);
                if (filter.value_type === 'datetime') {
                    filterValue = `'${filter.value.split('.')[0]}'`;
                } else {
                    filterValue = filter.value;
                }
                // if the filter is invalid, skip it and move to the next one
                if (filter.value === undefined) {
                    //console.log(5)
                    continue;
                }
                //append the fitler to the where clause array
                whereClauses.push(`${tableName}_${filter.columnName} ${filter.operator} ${filterValue}`);
                //console.log('Adding filter:', `${tableName}.${filter.columnName} ${filter.operator} ${filterValue}`);
            }
    
            // If there are any filters, append them to the query
            if (whereClauses.length > 0) {
                //console.log(6)
                filterQuery += ' WHERE ' + whereClauses.join(' AND ');
            }

            // Reset whereClauses array
            whereClauses = [];
        }
    });
    
    // This query builder handles sorting and pagination
    filterQuery += 
    ` ORDER BY ${tableName}.Approvals_id
    OFFSET ${filters.skipCount} ROWS 
    FETCH NEXT ${filters.topCount} ROWS ONLY`;

    return filterQuery;
}

//describe this!
function InnerJoinHandler(filterQuery: string): string {
    const tableName = 'TopApprovals';
    let innerJoinQuery = 
    `SELECT 
        ${tableName}.Approvals_id,
        ${tableName}.Approvals_active,
        ${tableName}.Approvals_title,
        ${tableName}.Approvals_subject,
        ${tableName}.Approvals_body,
        ${tableName}.Approvals_outcome,
        ${tableName}.Approvals_outcome_colour,
        ${tableName}.Approvals_parent_source,
        ${tableName}.Approvals_child_source,
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
        Approval_Users.response_datetime AS Approval_Users_response_datetime
    FROM (${filterQuery}) AS ${tableName}
    INNER JOIN Approval_Groups ON TopApprovals.Approvals_id = Approval_Groups.approval_id
    INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id`;
    
    return innerJoinQuery;
}

/*

    Example query

SELECT 
    TopApprovals.Approvals_id,
    TopApprovals.Approvals_active,
    TopApprovals.Approvals_title,
    TopApprovals.Approvals_subject,
    TopApprovals.Approvals_body,
    TopApprovals.Approvals_outcome,
    TopApprovals.Approvals_outcome_colour,
    TopApprovals.Approvals_parent_source,
    TopApprovals.Approvals_child_source,
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
    SELECT *
    FROM (
        SELECT 
            Approvals.id AS Approvals_id,
            Approvals.active AS Approvals_active,
            Approvals.title AS Approvals_title,
            Approvals.subject AS Approvals_subject,
            Approvals.body AS Approvals_body,
            Approvals.outcome AS Approvals_outcome,
            Approvals.outcome_colour AS Approvals_outcome_colour,
            Approvals.parent_source AS Approvals_parent_source,
            Approvals.child_source AS Approvals_child_source,
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
        INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
        WHERE Approval_Users.upn = 'dalel@silanna.com'
    ) AS UserApprovals
    WHERE UserApprovals.Approvals_active = 1 AND UserApprovals.Approvals_id > 32
    ORDER BY UserApprovals.Approvals_id
    OFFSET 0 ROWS 
    FETCH NEXT 2 ROWS ONLY
) AS TopApprovals 
INNER JOIN Approval_Groups ON TopApprovals.Approvals_id = Approval_Groups.approval_id
INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
*/