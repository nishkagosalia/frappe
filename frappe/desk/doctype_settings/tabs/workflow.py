import frappe
from frappe import _


# ── Public API ────────────────────────────────────────────────────────────────

@frappe.whitelist()
def get_data(doctype: str) -> dict:
	frappe.has_permission('Workflow', 'read', throw=True)

	workflows = frappe.get_all(
		'Workflow',
		filters={'document_type': doctype},
		fields=['name', 'is_active'],
		order_by='is_active desc, name asc',
	)

	for wf in workflows:
		wf['state_count'] = frappe.db.count('Workflow Document State', filters={'parent': wf['name']})
		wf['transition_count'] = frappe.db.count('Workflow Transition', filters={'parent': wf['name']})

	active = next((wf for wf in workflows if wf['is_active']), None)

	return {
		'active_workflow': active,
		'workflows': workflows,
	}


@frappe.whitelist()
def set_active_workflow(doctype: str, workflow_name: str) -> bool:
	frappe.has_permission('Workflow', 'write', throw=True)

	others = frappe.get_all(
		'Workflow',
		filters={'document_type': doctype, 'name': ['!=', workflow_name]},
		pluck='name',
	)
	for name in others:
		frappe.db.set_value('Workflow', name, 'is_active', 0)

	frappe.db.set_value('Workflow', workflow_name, 'is_active', 1)
	frappe.clear_cache(doctype=doctype)
	return True


@frappe.whitelist()
def deactivate_workflow(workflow_name: str) -> bool:
	frappe.has_permission('Workflow', 'write', throw=True)

	doc = frappe.get_doc('Workflow', workflow_name)
	frappe.clear_cache(doctype=doc.document_type)
	frappe.db.set_value('Workflow', workflow_name, 'is_active', 0)
	return True
