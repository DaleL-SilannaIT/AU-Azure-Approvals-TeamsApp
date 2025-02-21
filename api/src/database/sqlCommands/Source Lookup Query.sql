SELECT
    parent.id AS Parent_Approval_Sources_id,
    parent.display_name AS Parent_Approval_Sources_display_name,
    parent.display_order AS Parent_Approval_Sources_display_order,
    child.id AS Child_Approval_Sources_id,
    child.display_name AS Child_Approval_Sources_display_name,
    child.url AS Child_Approval_Sources_url
FROM Child_Approval_Sources child
INNER JOIN Parent_Approval_Sources parent ON parent.id = child.parent_source_id
ORDER BY parent.display_order, child.display_name;