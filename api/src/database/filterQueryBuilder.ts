import { ApprovalFilters, ApprovalUserFilters, ApprovalRequesterFilters } from './interfaces/filters';

export async function FilterQueryBuilder(filters: ApprovalFilters, object_id: string, userSecGrps: string[]): Promise<string> {

    let query = '';
    let subQueries = SubQueries(filters, object_id);
    let paginationQuery = PaginationFilter(filters);

    query += subQueries + paginationQuery;
    console.log('QUERY:', query);

    return query;
}

function CastValue(value: string, value_type: 'number' | 'string' | 'boolean' | 'datetime' | 'number_array' | 'string_array'): any {
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

function SubQueries(filters: ApprovalFilters, object_id: string): string {
    let subQueries = `WITH `;
    let queries = [];
    let requesters = JSON.parse(filters.approvalUserFilters.requestersFilters.value);
    let approvers = JSON.parse(filters.approvalUserFilters.approversFilters.value);

    if (requesters.length > 0) {
        queries.push(RequesterScopeHandler(filters));
    }

    if (approvers.length > 0) {
        queries.push(ApproverScopeHandler(filters));
    }

    queries.push(UserScopeHandler(filters, object_id));

    subQueries += queries.join(', ');

    return subQueries;
}

function RequesterScopeHandler(filters: ApprovalFilters): string {
    let query = '';
    let requesters;
    let firstRequester;
    let nthRequesters;

    try {
        requesters = JSON.parse(filters.approvalUserFilters.requestersFilters.value);
    } catch (error) {
        console.log('Error parsing requesters:', error);
        return '';
    }

    firstRequester = requesters[0];
    console.log('First Requester:', firstRequester);
    nthRequesters = requesters.slice(1);

    query =
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
        query += ` 
            ${filters.approvalUserFilters.requestersFilters.join_operator} EXISTS (
                SELECT 1
                FROM ${filters.approvalUserFilters.requestersFilters.tableName} AU
                WHERE AU.group_id = Approval_Groups.id
                AND AU.${filters.approvalUserFilters.requestersFilters.columnName} = '${nRequester}'
            )`;
    });

    query += `)`;
    return query;
}

function ApproverScopeHandler(filters: ApprovalFilters): string {
    let query = '';
    let approvers;
    let approversQueryArr = [];

    try {
        approvers = JSON.parse(filters.approvalUserFilters.approversFilters.value);
    } catch (error) {
        console.log('Error parsing approvers:', error);
        return '';
    }

    approvers.forEach(approver => {
        approversQueryArr.push(` 
            EXISTS (
                SELECT 1
                FROM ${filters.approvalUserFilters.approversFilters.tableName} AU
                WHERE AU.group_id = Approval_Groups.id
                AND AU.${filters.approvalUserFilters.approversFilters.columnName} = '${approver}'
            )`);

        query = approversQueryArr.join(` ${filters.approvalUserFilters.approversFilters.join_operator} `);
    });

    query =
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
                ) AND (${query})
            )
            `;

    return query;
}

function PaginationFilter(filters: ApprovalFilters): string {
    let query =
        `SELECT 
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
        Approval_Users.object_id AS Approval_Users_object_id,
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
        Child_Approval_Sources.display_name AS Child_Approval_Source_display_name
    FROM (
        SELECT 
            Approvals_id,
            Approvals_active,
            Approvals_title,
            Approvals_subject,
            Approvals_body,
            Approvals_outcome,
            Approvals_outcome_colour,
            Approvals_source_id,
            Approvals_entity_id,
            Approvals_entity_name,
            Approvals_entity_url,
            Approvals_has_notes,
            Approvals_has_attachments,
            Approvals_icon,
            Approvals_created_datetime,
            Approvals_attachments,
            Child_Approval_Source_display_name
        FROM NumberedApprovals
        WHERE RowNum = 1
        ORDER BY ${filters.sortField} ${filters.sortOrder}
        OFFSET ${filters.skipCount} ROWS 
        FETCH NEXT ${filters.topCount} ROWS ONLY
    ) AS TopApprovals
    INNER JOIN Approval_Groups ON TopApprovals.Approvals_id = Approval_Groups.approval_id
    INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
    INNER JOIN Child_Approval_Sources ON TopApprovals.Approvals_source_id = Child_Approval_Sources.id
    ORDER BY TopApprovals.${filters.sortField} ${filters.sortOrder};`;

    return query;
}

function GenerateFilters(filters: ApprovalFilters): string {
    let tableName = 'Approvals';
    let query = '';
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

                if (filter.value_type === 'number_array') {
                    whereClauses.push(filterValue);
                } else {
                    whereClauses.push(`${filter.tableName}.${filter.columnName} ${filter.operator} ${filterValue}`);
                }

            }

            if (whereClauses.length > 0) {
                query += ' AND ' + whereClauses.join(' AND ');
            }

            whereClauses = [];
        }
    });
    if (JSON.parse(filters.approvalUserFilters.requestersFilters.value).length > 0) {
        query +=
            ` AND Approvals.id IN (
            SELECT Approvals_id
            FROM FilteredRequesters
        )`
    }

    if (JSON.parse(filters.approvalUserFilters.approversFilters.value).length > 0) {
        query +=
            ` AND Approvals.id IN (
            SELECT Approvals_id
            FROM FilteredApprovers
        )`
    }

    return query;
}

function UserScopeHandler(filters: ApprovalFilters, object_id: string): string {
    //const groups = await fetchUserSecurityGroups(object_id);

    let userQuery =
        `NumberedApprovals AS (
        SELECT 
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
            Approvals.attachments AS Approvals_attachments,
            Child_Approval_Sources.display_name AS Child_Approval_Source_display_name,
            ROW_NUMBER() OVER (PARTITION BY Approvals.id ORDER BY Approvals.id DESC) AS RowNum
        FROM Approvals 
        INNER JOIN Approval_Groups ON Approvals.id = Approval_Groups.approval_id
        INNER JOIN Approval_Users ON Approval_Groups.id = Approval_Users.group_id
        INNER JOIN Child_Approval_Sources ON Approvals.source_id = Child_Approval_Sources.id 
        WHERE Approval_Users.object_id = '${object_id}' 
        ${GenerateFilters(filters)}
    )`

    return userQuery;
}