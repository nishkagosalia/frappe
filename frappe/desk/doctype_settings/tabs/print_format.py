import frappe


@frappe.whitelist()
def get_data(doctype: str) -> dict:
	"""Return print formats for the given DocType and its resolved default."""
	frappe.has_permission("DocType", "read", throw=True)

	meta = frappe.get_meta(doctype)

	return {
		"default_print_format": meta.default_print_format or "Standard",
		"formats": _build_format_list(doctype),
	}


@frappe.whitelist()
def create_format(doctype: str, name: str) -> str:
	"""Create a new custom print format for the DocType and return its name."""
	frappe.has_permission("Print Format", "create", throw=True)

	print_format = frappe.get_doc(
		{
			"doctype": "Print Format",
			"name": name,
			"doc_type": doctype,
			"print_format_for": "DocType",
			"print_format_builder_beta": 1,
		}
	)
	print_format.insert()
	return print_format.name


def _build_format_list(doctype: str) -> list:
	formats = frappe.get_list(
		"Print Format",
		filters={"doc_type": doctype},
		fields=["name", "standard", "custom_format", "print_format_builder_beta", "disabled"],
		order_by="name asc",
		ignore_permissions=True,
	)

	for fmt in formats:
		fmt["type"] = _format_type(fmt)

	return formats


def _format_type(fmt: dict) -> str:
	if fmt.get("standard") == "Yes":
		return "Standard"
	if fmt.get("print_format_builder_beta"):
		return "Builder"
	if fmt.get("custom_format"):
		return "Custom"
	return "Standard"
