frappe.doctype_settings.register('email', function (doctype, $panel) {
	const renderer = new EmailTabRenderer(doctype, $panel);
	renderer.render();
});

class EmailTabRenderer {
	constructor(doctype, $panel) {
		this.doctype = doctype;
		this.$panel = $panel;
		this.data = null;
	}

	render() {
		this.$panel.html(this.get_loading_html());
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.email.get_data',
			args: { doctype: this.doctype },
			callback: (r) => {
				if (!r.message) return;
				this.data = r.message;
				this.$panel.html(this.get_html());
				this.setup_interactions();
			},
		});
	}

	// ── HTML builders ──────────────────────────────────────────────────────

	get_loading_html() {
		return `<div class="dts-panel-loading"><div class="dts-spinner"></div></div>`;
	}

	get_html() {
		return `
			<div class="dts-panel-header">
				<h2 class="dts-panel-title">${__('Email')}</h2>
				<p class="dts-panel-sub">${__('Manage email templates linked to this DocType')}</p>
			</div>
			${this.get_templates_section()}
		`;
	}

	get_templates_section() {
		const templates = this.data.email_templates || [];
		return `
			<div class="dts-templates-section">
				<div class="dts-series-header">
					<div class="dts-section-label" style="margin:0;">${__('Email Templates')}</div>
					<button class="dts-open-link dts-btn-create-template">${__('+ Create Template')}</button>
				</div>
				<p class="dts-section-desc">
					${__('Email templates linked to this DocType.')}
				</p>

				<div class="dts-row-list dts-templates-list" style="margin-top: 10px;">
					${templates.map((t) => this.get_template_row_html(t)).join('')}
				</div>

				${templates.length === 0
					? `<div class="dts-empty dts-templates-empty">${__('No email templates linked to this DocType')}</div>`
					: ''}
			</div>
		`;
	}

	get_template_row_html(template) {
		const edit_url = frappe.utils.get_form_link('Email Template', template.name);
		return `
			<div class="dts-row" data-template="${frappe.utils.escape_html(template.name)}">
				<div class="dts-row-label dts-row-label--flex">
					<span>${frappe.utils.escape_html(template.name)}</span>
				</div>
				<div class="dts-row-right">
					<a class="dts-open-link" href="${edit_url}" target="_blank">${__('Edit')}</a>
					<button class="dts-open-link dts-open-link--danger dts-btn-delete-template">${__('Delete')}</button>
				</div>
			</div>
		`;
	}

	// ── Interactions ───────────────────────────────────────────────────────

	setup_interactions() {
		const $section = this.$panel.find('.dts-templates-section');

		$section.find('.dts-btn-create-template').on('click', () => {
			frappe.new_doc('Email Template', { reference_doctype: this.doctype });
		});

		$section.on('click', '.dts-btn-delete-template', (e) => {
			const $row = $(e.currentTarget).closest('.dts-row');
			this.handle_delete_template($row);
		});
	}

	// ── Action handlers ────────────────────────────────────────────────────

	handle_delete_template($row) {
		const template_name = $row.data('template');
		frappe.confirm(
			__('Delete template <strong>{0}</strong>? This cannot be undone.', [template_name]),
			() => {
				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.email.delete_email_template',
					args: { template_name },
					callback: (r) => {
						if (r.exc) return;
						this.data.email_templates = this.data.email_templates.filter(
							(t) => t.name !== template_name
						);
						$row.remove();
						if (this.$panel.find('.dts-templates-list .dts-row').length === 0) {
							this.$panel.find('.dts-templates-empty').show();
						}
						frappe.show_alert({ message: __('Template deleted'), indicator: 'green' });
					},
				});
			}
		);
	}
}
