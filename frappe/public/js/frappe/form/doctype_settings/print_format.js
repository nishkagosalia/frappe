frappe.doctype_settings.register('print-format', function (doctype, $panel, docname) {
	const renderer = new PrintFormatTabRenderer(doctype, $panel, docname);
	renderer.render();
});

class PrintFormatTabRenderer {
	constructor(doctype, $panel, docname) {
		this.doctype = doctype;
		this.$panel = $panel;
		this.docname = docname || null;
		this.data = null;
	}

	render() {
		this.$panel.html(this.get_loading_html());
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.print_format.get_data',
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
		const default_format = frappe.utils.escape_html(this.data.default_print_format);
		return `
			<div class="dts-panel-header">
				<h2 class="dts-panel-title">${__('Print Format')}</h2>
				<p class="dts-panel-sub">${__('Manage print formats for this document type')}</p>
			</div>
			<p class="dts-section-desc">
				${__('Current default: {0}', [`<strong>${default_format}</strong>`])}
			</p>
			${this.get_formats_section()}
			<div class="dts-divider"></div>
			<a class="dts-open-link dts-btn-print-settings">${__('Manage global Print Settings →')}</a>
		`;
	}

	get_formats_section() {
		const formats = this.data.formats || [];
		return `
			<div class="dts-formats-section">
				<div class="dts-series-header">
					<div class="dts-section-label" style="margin:0;">${__('Print Formats')}</div>
					<button class="dts-open-link dts-btn-create-format">${__('+ Create Print Format')}</button>
				</div>

				<div class="dts-row-list dts-formats-list" style="margin-top:10px;">
					${formats.map((fmt) => this.get_format_row_html(fmt)).join('')}
				</div>

				${formats.length === 0
					? `<div class="dts-empty dts-formats-empty">${__('No print formats defined for this DocType')}</div>`
					: ''}
			</div>
		`;
	}

	get_format_row_html(fmt) {
		const is_default = fmt.name === this.data.default_print_format;
		const type_badge = `<span class="dts-badge dts-badge--gray">${__(fmt.type)}</span>`;
		const default_badge = is_default
			? `<span class="dts-badge dts-badge--green">${__('Default')}</span>`
			: '';
		const set_default_btn = is_default
			? ''
			: `<button class="dts-open-link dts-btn-set-default">${__('Set as Default')}</button>`;

		return `
			<div class="dts-row" data-format="${frappe.utils.escape_html(fmt.name)}" data-builder="${fmt.print_format_builder_beta ? 1 : 0}">
				<div class="dts-row-label" style="display:flex;align-items:center;gap:8px;">
					<span style="font-size:13px;color:var(--text-color);">
						${frappe.utils.escape_html(fmt.name)}
					</span>
					${type_badge}
					${default_badge}
				</div>
				<div class="dts-row-right">
					<button class="dts-open-link dts-btn-edit">${__('Edit')}</button>
					${set_default_btn}
				</div>
			</div>
		`;
	}

	// ── Interactions ───────────────────────────────────────────────────────

	setup_interactions() {
		const $list = this.$panel.find('.dts-formats-list');

		$list.on('click', '.dts-btn-edit', (e) => {
			const $row = $(e.currentTarget).closest('.dts-row');
			const name = $row.data('format');
			if ($row.data('builder')) {
				this.open_builder(name);
			} else {
				frappe.set_route('print-format', name);
			}
		});

		$list.on('click', '.dts-btn-set-default', (e) => {
			const name = $(e.currentTarget).closest('.dts-row').data('format');
			this.handle_set_default(name);
		});

		this.$panel.find('.dts-btn-create-format').on('click', () => {
			this.handle_create_format();
		});

		this.$panel.find('.dts-btn-print-settings').on('click', () => {
			frappe.set_route('Form', 'Print Settings');
		});
	}

	// ── Action handlers ────────────────────────────────────────────────────

	handle_set_default(name) {
		frappe.call({
			method: 'frappe.printing.doctype.print_format.print_format.make_default',
			args: { name },
			callback: (r) => {
				if (r.exc) return;
				this.data.default_print_format = name;
				this.refresh();
			},
		});
	}

	handle_create_format() {
		frappe.prompt(
			{
				label: __('Print Format Name'),
				fieldname: 'name',
				fieldtype: 'Data',
				reqd: 1,
			},
			(values) => {
				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.print_format.create_format',
					args: { doctype: this.doctype, name: values.name },
					callback: (r) => {
						if (r.exc || !r.message) return;
						this.open_builder(r.message);
					},
				});
			},
			__('Create Print Format'),
			__('Create')
		);
	}

	// ── Helpers ────────────────────────────────────────────────────────────

	open_builder(name) {
		// Opened from a specific document → preview that document; from list view → default.
		if (this.docname) {
			frappe.route_options = { preview_doc: this.docname };
		}
		frappe.set_route('print-format-builder', name);
	}

	refresh() {
		this.$panel.html(this.get_html());
		this.setup_interactions();
	}
}
