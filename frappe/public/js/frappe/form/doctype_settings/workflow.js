frappe.doctype_settings.register('workflow', function (doctype, $panel) {
	const renderer = new WorkflowTabRenderer(doctype, $panel);
	renderer.render();
});

class WorkflowTabRenderer {
	constructor(doctype, $panel) {
		this.doctype = doctype;
		this.$panel = $panel;
		this.data = null;
	}

	render() {
		this.$panel.html(this.get_loading_html());
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.workflow.get_data',
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
				<h2 class="dts-panel-title">${__('Workflow')}</h2>
				<p class="dts-panel-sub">${__('Manage approval workflows for this document type')}</p>
			</div>
			${this.get_workflows_section()}
		`;
	}

	get_workflows_section() {
		const workflows = this.data.workflows || [];
		return `
			<div class="dts-workflows-section">
				<div class="dts-series-header">
					<div class="dts-section-label" style="margin:0;">${__('Workflows')}</div>
					<button class="dts-open-link dts-btn-create-workflow">${__('Create Workflow')}</button>
				</div>

				<div class="dts-row-list dts-workflows-list" style="margin-top:10px;">
					${workflows.map((wf) => this.get_workflow_row_html(wf)).join('')}
				</div>

				${workflows.length === 0
					? `<div class="dts-empty dts-workflows-empty">${__('No workflows defined for this DocType')}</div>`
					: ''}
			</div>
		`;
	}

	get_workflow_row_html(wf) {
		const status_badge = wf.is_active
			? `<span class="dts-badge dts-badge--green">${__('Active')}</span>`
			: `<span class="dts-badge dts-badge--gray">${__('Inactive')}</span>`;

		const action_btn = wf.is_active
			? `<button class="dts-open-link dts-btn-deactivate" style="color:var(--red-500,var(--red));">${__('Deactivate')}</button>`
			: `<button class="dts-open-link dts-btn-set-active">${__('Set Active')}</button>`;

		return `
			<div class="dts-row" data-workflow="${frappe.utils.escape_html(wf.name)}">
				<div class="dts-row-label" style="display:flex;align-items:center;gap:8px;">
					<span style="font-size:13px;color:var(--text-color);">
						${frappe.utils.escape_html(wf.name)}
					</span>
					${status_badge}
				</div>
				<div class="dts-row-right">
					<span class="dts-row-value">${__(`{0} state(s)`, [wf.state_count])}</span>
					<span class="dts-row-value">${__(`{0} transition(s)`, [wf.transition_count])}</span>
					<button class="dts-open-link dts-btn-edit">${__('Edit')}</button>
					${action_btn}
				</div>
			</div>
		`;
	}

	// ── Interactions ───────────────────────────────────────────────────────

	setup_interactions() {
		const $list = this.$panel.find('.dts-workflows-list');

		$list.on('click', '.dts-btn-edit', (e) => {
			const wf_name = $(e.currentTarget).closest('.dts-row').data('workflow');
			frappe.set_route('Form', 'Workflow', wf_name);
		});

		$list.on('click', '.dts-btn-set-active', (e) => {
			const wf_name = $(e.currentTarget).closest('.dts-row').data('workflow');
			this.handle_set_active(wf_name);
		});

		$list.on('click', '.dts-btn-deactivate', (e) => {
			const wf_name = $(e.currentTarget).closest('.dts-row').data('workflow');
			this.handle_deactivate(wf_name);
		});

		this.$panel.find('.dts-btn-create-workflow').on('click', () => {
			frappe.new_doc('Workflow', { document_type: this.doctype });
		});
	}

	handle_set_active(wf_name) {
		frappe.call({
			method: 'frappe.desk.doctype_settings.tabs.workflow.set_active_workflow',
			args: { doctype: this.doctype, workflow_name: wf_name },
			callback: (r) => {
				if (r.exc) return;
				this.data.workflows.forEach((wf) => {
					wf.is_active = wf.name === wf_name ? 1 : 0;
				});
				this.data.active_workflow = this.data.workflows.find((wf) => wf.name === wf_name);
				this.refresh();
				frappe.show_alert({ message: __('Workflow activated'), indicator: 'green' });
			},
		});
	}

	handle_deactivate(wf_name) {
		frappe.confirm(
			__('Deactivate workflow <strong>{0}</strong>? Documents will no longer be subject to this workflow.', [wf_name]),
			() => {
				frappe.call({
					method: 'frappe.desk.doctype_settings.tabs.workflow.deactivate_workflow',
					args: { workflow_name: wf_name },
					callback: (r) => {
						if (r.exc) return;
						const wf = this.data.workflows.find((w) => w.name === wf_name);
						if (wf) wf.is_active = 0;
						this.data.active_workflow = null;
						this.refresh();
						frappe.show_alert({ message: __('Workflow deactivated'), indicator: 'orange' });
					},
				});
			}
		);
	}

	// ── Helpers ────────────────────────────────────────────────────────────

	refresh() {
		this.$panel.html(this.get_html());
		this.setup_interactions();
	}
}
