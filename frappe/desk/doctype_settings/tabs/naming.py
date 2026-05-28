import frappe
from frappe import _
from frappe.model.naming import NamingSeries


# ── Public API ────────────────────────────────────────────────────────────────

@frappe.whitelist()
def get_data(doctype: str) -> dict:
	meta = frappe.get_meta(doctype)
	field = meta.get_field('naming_series')

	return {
		'autoname': meta.autoname or 'hash',
		'has_naming_series_field': field is not None,
		'series': _build_series_list(meta),
		'naming_rules': _build_naming_rules_list(doctype),
	}


# ── Naming Series ─────────────────────────────────────────────────────────────

@frappe.whitelist()
def update_options(doctype: str, options: str) -> bool:
	"""Add or remove series by passing the full updated newline-separated options string.
	Delegates to DocumentNamingSettings.set_series_options_in_meta so that Property
	Setters, validation, and cache-clearing all follow core Frappe behaviour.
	"""
	frappe.has_permission('DocType', 'write', throw=True)

	settings = frappe.get_doc('Document Naming Settings')
	settings.set_series_options_in_meta(doctype, options)
	return True


@frappe.whitelist()
def set_default_series(doctype: str, series: str) -> bool:
	"""Set the default naming series via Property Setter — same as
	DocumentNamingSettings.update_naming_series_property_setter.
	"""
	frappe.has_permission('DocType', 'write', throw=True)

	_make_naming_series_property_setter(doctype, 'default', series)
	frappe.clear_cache(doctype=doctype)
	return True


@frappe.whitelist()
def update_series_current(series: str, current: int) -> bool:
	"""Update the counter for a naming series prefix.
	Delegates to NamingSeries.update_counter which evaluates the real prefix
	(e.g. INV-.YYYY.- → INV-2026-) before writing to the Series table.
	"""
	frappe.only_for('System Manager')

	NamingSeries(series).update_counter(int(current))
	return True


@frappe.whitelist()
def preview_series(series: str, doctype: str | None = None) -> list[str]:
	"""Return 3 sample names via NamingSeries.get_preview (no counter increment).
	Optionally passes the last saved document so field-based parts can be evaluated.
	"""
	doc = _fetch_last_doc(doctype)
	try:
		return NamingSeries(series).get_preview(doc=doc)
	except Exception as e:
		frappe.clear_last_message()
		frappe.throw(_('Invalid series pattern: {0}').format(str(e)))


# ── Document Naming Rules ─────────────────────────────────────────────────────

@frappe.whitelist()
def create_naming_rule(doctype: str, prefix: str, prefix_digits: int = 5, priority: int = 0) -> dict:
	frappe.has_permission('Document Naming Rule', 'create', throw=True)

	doc = frappe.get_doc({
		'doctype': 'Document Naming Rule',
		'document_type': doctype,
		'prefix': prefix,
		'prefix_digits': int(prefix_digits),
		'priority': int(priority),
		'disabled': 0,
	})
	doc.insert()

	return _rule_to_dict(doc)


@frappe.whitelist()
def toggle_naming_rule(rule_name: str, disabled: int) -> bool:
	frappe.has_permission('Document Naming Rule', 'write', throw=True)

	doc = frappe.get_doc('Document Naming Rule', rule_name)
	doc.disabled = int(disabled)
	doc.save()
	return True


@frappe.whitelist()
def delete_naming_rule(rule_name: str) -> bool:
	frappe.has_permission('Document Naming Rule', 'delete', throw=True)

	frappe.delete_doc('Document Naming Rule', rule_name)
	return True


# ── Private helpers ──────────────────────────────────────────────────────────

def _build_series_list(meta) -> list:
	field = meta.get_field('naming_series')
	if not field or not field.options:
		return []

	default = (field.default or '').strip()
	result = []

	for name in meta.get_naming_series_options():
		name = name.strip()
		if not name:
			continue
		current = NamingSeries(name).get_current_value()
		result.append({
			'name': name,
			'current': current,
			'is_default': name == default,
		})

	return result


def _build_naming_rules_list(doctype: str) -> list:
	rules = frappe.get_all(
		'Document Naming Rule',
		filters={'document_type': doctype},
		fields=['name', 'prefix', 'counter', 'prefix_digits', 'priority', 'disabled'],
		order_by='priority desc',
	)

	for rule in rules:
		rule['conditions'] = frappe.get_all(
			'Document Naming Rule Condition',
			filters={'parent': rule['name']},
			fields=['field', 'condition', 'value'],
			order_by='idx asc',
		)

	return rules


def _rule_to_dict(doc) -> dict:
	return {
		'name': doc.name,
		'prefix': doc.prefix,
		'counter': doc.counter,
		'prefix_digits': doc.prefix_digits,
		'priority': doc.priority,
		'disabled': doc.disabled,
		'conditions': [],
	}


def _make_naming_series_property_setter(doctype: str, property_name: str, value: str) -> None:
	from frappe.custom.doctype.property_setter.property_setter import make_property_setter
	make_property_setter(doctype, 'naming_series', property_name, value, 'Text')


def _fetch_last_doc(doctype: str | None):
	if not doctype:
		return None
	try:
		return frappe.get_last_doc(doctype)
	except Exception:
		return None
