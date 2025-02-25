export function RequestersQueryBuilder(object_id: string): string {
    let requesterQuery = 
    `SELECT 
        DISTINCT Approval_Users.object_id, 
        Approval_Users.upn, 
        Approval_Users.email, 
        Approval_Users.display_name
    FROM [dbo].[Approval_Users] Approval_Users
    WHERE Approval_Users.group_id IN (
        SELECT Approval_Groups.id 
        FROM Approvals Approvals
        INNER JOIN Approval_Groups Approval_Groups ON Approvals.id = Approval_Groups.approval_id
        INNER JOIN Approval_Users au ON Approval_Groups.id = au.group_id
        WHERE au.object_id = '${object_id}'
        AND Approval_Groups.id = (
            SELECT MIN(Approval_Groups_Join.id)
            FROM Approval_Groups Approval_Groups_Join
            WHERE Approval_Groups_Join.approval_id = Approvals.id
        )
    ) 
    ORDER BY Approval_Users.display_name;`
    //AND Approval_Users.object_id != '${object_id}';`
    
    return requesterQuery;
};