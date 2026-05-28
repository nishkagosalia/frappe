import "./dialog";
import "./naming";
import "./workflow";

$(document).on("form-refresh", function (e, frm) {
    if (!frm) return;
    frm.page.add_menu_item(__("DocType Settings"), function () {
        frappe.doctype_settings.open(frm.doctype);
    }, true);
});