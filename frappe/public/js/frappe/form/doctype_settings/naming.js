frappe.doctype_settings.register('naming', function (doctype, $panel) {
	const renderer = new NamingTabRenderer(doctype, $panel);
	renderer.render();
});

class NamingTabRenderer {
	constructor(doctype, $panel) {
		this.doctype = doctype;
		this.$panel = $panel;
		this.data = null;
	}

	render() {
		this.$panel.html(this.get_loading_html());
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.naming.get_data',
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
				<h2 class="dts-panel-title">${__('Naming & Series')}</h2>
				<p class="dts-panel-sub">${__('Configure how documents are named and numbered')}</p>
			</div>
			${this.get_series_section()}
			${this.get_preview_section()}
			${this.get_document_naming_rules_section()}
		`;
	}

	get_series_section() {
		const can_manage = this.data.has_naming_series_field;
		return `
			<div class="dts-naming-series-section">
				<div class="dts-series-header">
					<div class="dts-section-label" style="margin:0;">${__('Naming Series')}</div>
					${can_manage ? `<button class="dts-open-link dts-btn-add-series">${__('+ Add Series')}</button>` : ''}
				</div>

				<div class="dts-add-series-form" style="display:none;margin-top:8px;">
					<input
						type="text"
						class="form-control input-xs dts-series-input"
						placeholder="${__('e.g. INV-.YYYY.MM.DD.-.#####')}"
					>
					<div class="dts-add-preview-row">
						<span class="dts-add-preview-label">${__('Example:')}</span>
						<span class="dts-series-preview-inline"></span>
					</div>
					<div class="dts-actions" style="margin-top:6px;">
						<button class="btn btn-xs btn-primary dts-btn-confirm-add">${__('Add')}</button>
						<button class="btn btn-xs dts-btn-cancel-add">${__('Cancel')}</button>
					</div>
				</div>

				<div class="dts-row-list dts-series-list" style="margin-top:10px;">
					${this.data.series.map((s) => this.get_series_row_html(s)).join('')}
				</div>

				${this.data.series.length === 0
					? `<div class="dts-empty dts-series-empty">${__('No naming series configured for this DocType')}</div>`
					: ''}

				<div class="dts-divider"></div>
			</div>
		`;
	}

	get_series_row_html(series) {
		const default_badge = series.is_default
			? `<span class="dts-badge dts-badge--green">${__('Default')}</span>`
			: '';

		const set_default_btn = !series.is_default
			? `<button class="dts-open-link dts-btn-set-default">${__('Set Default')}</button>`
			: '';

		return `
			<div class="dts-row" data-series="${frappe.utils.escape_html(series.name)}">
				<div class="dts-row-label dts-row-label--flex">
					<span class="dts-series-name">${frappe.utils.escape_html(series.name)}</span>
					${default_badge}
				</div>
				<div class="dts-row-right">
					<span class="dts-counter-pill dts-counter-display">
						#<strong class="dts-series-current">${series.current}</strong>
					</span>
					${set_default_btn}
					<button class="dts-open-link dts-btn-edit-counter">${__('Edit Counter')}</button>
					<button class="dts-open-link dts-open-link--danger dts-btn-remove">${__('Remove')}</button>
				</div>
			</div>
		`;
	}

	get_preview_section() {
		const autoname = this.data.autoname || 'hash';

		if (autoname === 'hash') {
			return this.get_hash_preview_html();
		}

		const preview_series = this.data.series.find((s) => s.is_default) || this.data.series[0];

		return `
			<div>
				<div class="dts-section-label">${__('Preview')}</div>
				<div class="dts-card dts-preview-card">
					<div class="dts-card-label">${__('Example Name')}</div>
					<div class="dts-preview-list">
						${preview_series
							? `<div class="dts-preview-item">…</div>`
							: `<div class="dts-preview-item--empty">${__('Add a series above to see a preview')}</div>`
						}
					</div>
					${preview_series
						? `<div class="dts-card-meta" style="margin-top:10px;">
								${__('Based on series')} <strong class="dts-preview-series">${frappe.utils.escape_html(preview_series.name)}</strong>
							</div>`
						: ''}
				</div>
				<div class="dts-divider"></div>
			</div>
		`;
	}

	get_document_naming_rules_section() {
		const rules = this.data.naming_rules || [];
		return `
			<div class="dts-naming-rules-section">
				<div class="dts-series-header">
					<div class="dts-section-label" style="margin:0;">${__('Naming Rules')}</div>
					<button class="dts-open-link dts-btn-add-rule">${__('+ Add Rule')}</button>
				</div>
				<p class="dts-section-desc">
					${__('Automatically assign a naming prefix based on document field values — e.g. use a different series per customer or region.')}
					<a class="dts-doc-link" href="https://docs.frappe.io/erpnext/document-naming" target="_blank" rel="noopener">
						${__('Learn more')} ↗
					</a>
				</p>

				<div class="dts-row-list dts-rules-list" style="margin-top:10px;">
					${rules.map((r) => this.get_naming_rule_row_html(r)).join('')}
				</div>

				${rules.length === 0
					? `<div class="dts-empty dts-rules-empty">${__('No naming rules configured for this DocType')}</div>`
					: ''}
			</div>
		`;
	}

	get_naming_rule_row_html(rule) {
		const count = rule.conditions.length;
		const conditions_label = count === 0
			? __('No conditions')
			: count === 1
				? __('1 condition')
				: __('{0} conditions', [count]);

		const status_badge = rule.disabled
			? `<span class="dts-badge dts-badge--gray">${__('Disabled')}</span>`
			: `<span class="dts-badge dts-badge--green">${__('Active')}</span>`;

		const edit_url = frappe.utils.get_form_link('Document Naming Rule', rule.name);

		return `
			<div class="dts-row" data-rule="${frappe.utils.escape_html(rule.name)}">
				<div class="dts-row-label dts-row-label--flex">
					<span class="dts-series-name">${frappe.utils.escape_html(rule.prefix)}</span>
					${status_badge}
				</div>
				<div class="dts-row-right">
					<span class="dts-priority-label">${__('Priority')} <strong>${rule.priority}</strong></span>
					<span class="dts-row-value">${conditions_label}</span>
					<a class="dts-open-link" href="${edit_url}" target="_blank">${__('Edit')}</a>
					<button class="dts-open-link dts-btn-toggle-rule">
						${rule.disabled ? __('Enable') : __('Disable')}
					</button>
					<button class="dts-open-link dts-open-link--danger dts-btn-delete-rule">${__('Delete')}</button>
				</div>
			</div>
		`;
	}

	get_hash_preview_html() {
		return `
			<div>
				<div class="dts-section-label">${__('Preview')}</div>
				<div class="dts-card">
					<div class="dts-card-label">${__('Document Name Format')}</div>
					<div class="dts-card-value dts-card-value--mono">abc123def456</div>
					<div class="dts-card-meta">${__('Random 12-character hash — unique each time')}</div>
				</div>
				<div class="dts-divider"></div>
			</div>
		`;
	}

	// ── Preview ────────────────────────────────────────────────────────────

	fetch_and_show_preview(series_name) {
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.naming.preview_series',
			args: { series: series_name, doctype: this.doctype },
			callback: (r) => {
				if (r.exc || !r.message?.length) return;
				this.$panel.find('.dts-preview-item').text(r.message[0]);
				this.$panel.find('.dts-preview-series').text(series_name);
			},
		});
	}

	fetch_inline_preview(series_name, $target) {
		if (!series_name) {
			$target.text('');
			return;
		}
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.naming.preview_series',
			args: { series: series_name, doctype: this.doctype },
			callback: (r) => {
				$target.text(r.exc || !r.message?.length ? __('Invalid pattern') : r.message[0]);
			},
		});
	}

	// ── Interactions ───────────────────────────────────────────────────────

	setup_interactions() {
		this.setup_add_series_form();
		this.setup_series_row_actions();
		this.setup_naming_rule_actions();

		// Fetch the initial preview from the backend once the DOM is ready
		const preview_series = this.data.series.find((s) => s.is_default) || this.data.series[0];
		if (preview_series) {
			this.fetch_and_show_preview(preview_series.name);
		}
	}

	setup_add_series_form() {
		const $section = this.$panel.find('.dts-naming-series-section');

		$section.find('.dts-btn-add-series').on('click', () => {
			$section.find('.dts-add-series-form').show();
			$section.find('.dts-series-input').focus();
		});

		$section.find('.dts-btn-cancel-add').on('click', () => this.close_add_form());

		$section.find('.dts-btn-confirm-add').on('click', () => {
			const value = $section.find('.dts-series-input').val().trim();
			if (!value) {
				frappe.show_alert({ message: __('Please enter a series pattern'), indicator: 'orange' });
				return;
			}
			this.add_series(value);
		});

		// Debounce backend preview calls while typing a new pattern
		let preview_timer = null;
		$section.find('.dts-series-input').on('input', (e) => {
			const value = $(e.target).val().trim();
			const $inline = $section.find('.dts-series-preview-inline');
			$inline.text('…');
			clearTimeout(preview_timer);
			preview_timer = setTimeout(
				() => this.fetch_inline_preview(value, $inline),
				400
			);
		});

		$section.find('.dts-series-input').on('keydown', (e) => {
			if (e.key === 'Enter') $section.find('.dts-btn-confirm-add').trigger('click');
			if (e.key === 'Escape') this.close_add_form();
		});
	}

	setup_series_row_actions() {
		const $list = this.$panel.find('.dts-series-list');

		$list.on('click', '.dts-btn-set-default', (e) => {
			const series = $(e.currentTarget).closest('.dts-row').data('series');
			this.handle_set_default(series);
		});

		$list.on('click', '.dts-btn-edit-counter', (e) => {
			const $row = $(e.currentTarget).closest('.dts-row');
			this.handle_edit_counter($row);
		});

		$list.on('click', '.dts-btn-remove', (e) => {
			const $row = $(e.currentTarget).closest('.dts-row');
			this.handle_remove($row, $row.data('series'));
		});
	}

	// ── Action handlers ────────────────────────────────────────────────────

	add_series(new_series) {
		const updated_options = this.data.series
			.map((s) => s.name)
			.concat([new_series])
			.join('\n');

		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.naming.update_options',
			args: { doctype: this.doctype, options: updated_options },
			callback: (r) => {
				if (r.exc) return;
				const new_entry = { name: new_series, current: 0, is_default: false };
				this.data.series.push(new_entry);
				this.$panel.find('.dts-series-list').append(this.get_series_row_html(new_entry));
				this.$panel.find('.dts-series-empty').hide();
				this.close_add_form();
				frappe.show_alert({ message: __('Series added'), indicator: 'green' });
			},
		});
	}

	handle_set_default(series) {
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.naming.set_default_series',
			args: { doctype: this.doctype, series },
			callback: (r) => {
				if (r.exc) return;

				// Sync local data
				this.data.series.forEach((s) => (s.is_default = s.name === series));

				// Scope to series rows only — naming rule rows also have .dts-badge
				// and must not have their Active/Disabled badge accidentally removed
				this.$panel.find('.dts-series-list .dts-row').each((_, el) => {
					const $row = $(el);
					const is_new_default = $row.data('series') === series;
					$row.find('.dts-badge').remove();
					$row.find('.dts-btn-set-default').remove();
					const $label = $row.find('.dts-row-label');
					if (is_new_default) {
						$label.append(`<span class="dts-badge dts-badge--green">${__('Default')}</span>`);
					} else {
						$(`<button class="dts-open-link dts-btn-set-default">${__('Set Default')}</button>`)
							.insertAfter($row.find('.dts-counter-display'));
					}
				});

				this.refresh_preview(series);
				frappe.show_alert({ message: __('Default series updated'), indicator: 'green' });
			},
		});
	}

	handle_edit_counter($row) {
		const series = $row.data('series');
		const current = parseInt($row.find('.dts-series-current').text()) || 0;

		const dialog = new frappe.ui.Dialog({
			title: __('Update Counter — {0}', [series]),
			fields: [
				{
					label: __('Current Counter Value'),
					fieldname: 'current',
					fieldtype: 'Int',
					default: current,
					description: __('The next document will be numbered {0}', [current + 1]),
				},
			],
			primary_action_label: __('Update'),
			primary_action: (values) => {
				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.naming.update_series_current',
					args: { series, current: values.current },
					callback: (r) => {
						if (r.exc) return;
						$row.find('.dts-series-current').text(values.current);
						const entry = this.data.series.find((s) => s.name === series);
						if (entry) entry.current = values.current;
						const is_default = $row.find('.dts-badge--green').length > 0;
						if (is_default) this.refresh_preview(series);
						dialog.hide();
						frappe.show_alert({ message: __('Counter updated'), indicator: 'green' });
					},
				});
			},
		});
		dialog.show();
	}

	handle_remove($row, series) {
		frappe.confirm(
			__('Remove series <strong>{0}</strong>? This cannot be undone.', [series]),
			() => {
				const remaining_options = this.data.series
					.filter((s) => s.name !== series)
					.map((s) => s.name)
					.join('\n');

				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.naming.update_options',
					args: { doctype: this.doctype, options: remaining_options },
					callback: (r) => {
						if (r.exc) return;
						this.data.series = this.data.series.filter((s) => s.name !== series);
						$row.remove();
						if (this.$panel.find('.dts-series-list .dts-row').length === 0) {
							this.$panel.find('.dts-series-empty').show();
						}
						frappe.show_alert({ message: __('Series removed'), indicator: 'green' });
					},
				});
			}
		);
	}

	// ── Naming Rule actions ────────────────────────────────────────────────

	setup_naming_rule_actions() {
		const $section = this.$panel.find('.dts-naming-rules-section');

		$section.find('.dts-btn-add-rule').on('click', () => this.handle_add_rule());

		$section.on('click', '.dts-btn-toggle-rule', (e) => {
			const $row = $(e.currentTarget).closest('.dts-row');
			this.handle_toggle_rule($row);
		});

		$section.on('click', '.dts-btn-delete-rule', (e) => {
			const $row = $(e.currentTarget).closest('.dts-row');
			this.handle_delete_rule($row);
		});
	}

	handle_add_rule() {
		const dialog = new frappe.ui.Dialog({
			title: __('Add Naming Rule'),
			fields: [
				{
					label: __('Prefix'),
					fieldname: 'prefix',
					fieldtype: 'Data',
					reqd: 1,
					description: __('Naming prefix, e.g. INV-{YYYY}-'),
				},
				{ fieldtype: 'Column Break' },
				{
					label: __('Digits'),
					fieldname: 'prefix_digits',
					fieldtype: 'Int',
					default: 5,
					description: __('Counter digits, e.g. 5 → 00001'),
				},
				{ fieldtype: 'Section Break' },
				{
					label: __('Priority'),
					fieldname: 'priority',
					fieldtype: 'Int',
					default: 0,
					description: __('Higher number = applied first when multiple rules exist'),
				},
			],
			primary_action_label: __('Create'),
			primary_action: (values) => {
				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.naming.create_naming_rule',
					args: { doctype: this.doctype, ...values },
					callback: (r) => {
						if (r.exc) return;
						this.data.naming_rules.push(r.message);
						const $list = this.$panel.find('.dts-rules-list');
						$list.append(this.get_naming_rule_row_html(r.message));
						this.$panel.find('.dts-rules-empty').hide();
						dialog.hide();
						frappe.show_alert({ message: __('Naming rule created'), indicator: 'green' });
					},
				});
			},
		});
		dialog.show();
	}

	handle_toggle_rule($row) {
		const rule_name = $row.data('rule');
		const rule = this.data.naming_rules.find((r) => r.name === rule_name);
		if (!rule) return;

		const new_disabled = rule.disabled ? 0 : 1;
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.naming.toggle_naming_rule',
			args: { rule_name, disabled: new_disabled },
			callback: (r) => {
				if (r.exc) return;
				rule.disabled = new_disabled;
				$row.replaceWith(this.get_naming_rule_row_html(rule));
				frappe.show_alert({
					message: new_disabled ? __('Rule disabled') : __('Rule enabled'),
					indicator: new_disabled ? 'orange' : 'green',
				});
			},
		});
	}

	handle_delete_rule($row) {
		const rule_name = $row.data('rule');
		frappe.confirm(
			__('Delete naming rule <strong>{0}</strong>? This cannot be undone.', [rule_name]),
			() => {
				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.naming.delete_naming_rule',
					args: { rule_name },
					callback: (r) => {
						if (r.exc) return;
						this.data.naming_rules = this.data.naming_rules.filter((r) => r.name !== rule_name);
						$row.remove();
						if (this.$panel.find('.dts-rules-list .dts-row').length === 0) {
							this.$panel.find('.dts-rules-empty').show();
						}
						frappe.show_alert({ message: __('Naming rule deleted'), indicator: 'green' });
					},
				});
			}
		);
	}

	// ── Preview helpers ────────────────────────────────────────────────────

	refresh_preview(series_name) {
		this.fetch_and_show_preview(series_name);
	}

	close_add_form() {
		const $section = this.$panel.find('.dts-naming-series-section');
		$section.find('.dts-add-series-form').hide();
		$section.find('.dts-series-input').val('');
		$section.find('.dts-series-preview-inline').text('');
	}
}
