import frappe

@frappe.whitelist()
def get_data(doctype: str) -> dict:
	"""Return email templates linked to the given DocType."""
	frappe.has_permission("DocType", "read", throw=True)

	return {"email_templates": _build_template_list(doctype)}


@frappe.whitelist()
def delete_email_template(template_name: str) -> bool:
	"""Delete an email template."""
	frappe.has_permission("Email Template", "delete", throw=True)

	frappe.delete_doc("Email Template", template_name)
	return True


def _build_template_list(doctype: str) -> list:
	return frappe.get_list(
		"Email Template",
		filters={"reference_doctype": doctype},
		fields=["name", "subject"],
		order_by="name asc",
		ignore_permissions=True,
	)
