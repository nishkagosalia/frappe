frappe.provide("frappe.doctype_settings");

frappe.doctype_settings.registry = frappe.doctype_settings.registry || {};
frappe.doctype_settings.register = function (tab_id, renderer) {
    this.registry[tab_id] = renderer;
};

frappe.doctype_settings.tabs = [ { label :__("Document Configuration"), items:[
    {id: 'naming', 
	 label: __("Naming & Series"),
	 icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-file-sliders-icon lucide-file-sliders\"><path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"/><path d=\"M8 12h8\"/><path d=\"M10 11v2\"/><path d=\"M8 17h8\"/><path d=\"M14 16v2\"/></svg>"},
	{id: 'workflow', label: __("Workflow"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-workflow-icon lucide-workflow\"><rect width=\"8\" height=\"8\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M7 11v4a2 2 0 0 0 2 2h4\"/><rect width=\"8\" height=\"8\" x=\"13\" y=\"13\" rx=\"2\"/></svg>"} ]},
	{ label: __("Print & Communication"), items:[
		{id: 'print-format', label: __("Print Format"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-printer-icon lucide-printer\"><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"/><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\"/><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\"/></svg>"},
		{id: 'email', label: __("Email"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-mail-icon lucide-mail\"><path d=\"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z\"/><polyline points=\"22,6 12,13 2,6\"/></svg>"},
		{id: 'notifications', label: __("Notifications"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-bell-icon lucide-bell\"><path d=\"M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9\"/><path d=\"M13.73 21a2 2 0 0 1-3.46 0\"/></svg>"}
	]},
	{
		label: __("Access & Search"), items:[
			{id: 'permissions', label: __("Permissions"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-shield-check-icon lucide-shield-check\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"m9 12 2 2 4-4\"/></svg>"},
			{id: 'Global Search', label: __("Global Search"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-search-icon lucide-search\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/></svg>"}
		]
	},
	{
		label: __("Import & Export"), items:[
			{id: 'data-import', label: __("Data Import"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-file-import-icon lucide-file-import\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14,2 14,8 20,8\"/><path d=\"M12.41,16.58a1,1,0,0,1,1.42,0l4,4a1,1 0 0,1-1.42,1.42L13,18.42a1,1 0 0,1,0-1.42z\"/></svg>"},
			{id: 'data-export', label: __("Data Export"), icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-file-export-icon lucide-file-export\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14,2 14,8 20,8\"/><path d=\"M12.41,7.41a1,1,0,0,1,1.42,0l4,4a1,1 0 0,1-1.42,1.42L13,9.42a1,1 0 0,1,0-1.42z\"/></svg>"}
		]
	}
]


frappe.doctype_settings.open = function(doctype) {
    const dialog = new frappe.doctype_settings.dialog(doctype);
    dialog.show();
}

frappe.doctype_settings.dialog = class DoctypeSettingsDialog {
    constructor(doctype) {
        this.doctype = doctype;
        this.active_tab = null; 
        this._loaded_tabs = new Set();
    }

    show(){
        this.make_dialog();
        this.dialog.show();
        this.activate_tab(frappe.doctype_settings.tabs[0].items[0].id);
    }
    
    make_dialog() {
        this.dialog = new frappe.ui.Dialog({
            title: __("Settings for {0}", [__(this.doctype)]),
            size: 'extra-large',
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'dt_settings_body',
                    options: this._get_layout_html()
                }
            ]
        });	
        
        const $wrapper = this.dialog.$wrapper;

        $wrapper.find('.modal-header').hide();
        $wrapper.find('.modal-body').css({ padding: '0' });
        this.dialog.footer.hide();

        // Push the dialog below Frappe's sticky navbar (48px) + breathing room.
        // Done via JS so it overrides Bootstrap's own margin: 1.75rem auto.
        $wrapper.find('.modal-dialog').css({
            marginTop: '64px',
            marginBottom: '16px',
            maxWidth: '1024px',
        });

		$wrapper.find('.modal-content').css({
            borderRadius: '12px',
            overflow: 'hidden',
        });
 

            
        this.$sidebar = $wrapper.find('.dts-sidebar');
        this.$content = $wrapper.find('.dts-content');
        this._sync_sidebar_click();
    }

    _get_layout_html() {
       return `
		<div class="dts-root">
		
		<aside class="dts-sidebar">
			
 
			<nav class="dts-nav">
					${this._sidebar_groups_html()}
			</nav>
		</aside>
 
			<main class="dts-content">
 
				<button class="dts-close-btn" title="Close">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="1" stroke-linecap="round">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
 
				${this._all_panels_html()}
 
			</main>
 
		</div>`;
    }

    _sidebar_groups_html() {
		return frappe.doctype_settings.tabs.map(group => `
			<div class="dts-nav-group">
				<div class="dts-nav-group-label">${__(group.label)}</div>
				<nav style="display:flex;flex-direction:column;gap:3px;">
					${group.items.map(item => `
						<button class="dts-nav-item" data-tab="${item.id}">
							<span class="dts-nav-item-icon">${item.icon}</span>
							<span class="dts-nav-item-label">${__(item.label)}</span>
						</button>
					`).join('')}
				</nav>
			</div>
		`).join('');
	}

    _all_panels_html() {
		const all_items = frappe.doctype_settings.tabs
			.flatMap(g => g.items);
 
		return all_items.map(item => `
			<div class="dts-panel" id="dts-panel-${item.id}">
				<div class="dts-panel-loading">
					<div class="dts-spinner"></div>
				</div>
			</div>
		`).join('');
	}
 
 

    _sync_sidebar_click(){
        const me = this;
        this.$sidebar.on("click", ".dts-nav-item", function() {
            const tab_id = $(this).data("tab");
            me.activate_tab(tab_id);
        });

       this.$content.on('click', '.dts-close-btn', function () {
    	me.dialog.hide();
		});
    }

    activate_tab(tab_id) {
        if(this.active_tab === tab_id) return;
        
       this.active_tab = tab_id;

       this.$sidebar
			.find('.dts-nav-item')
			.removeClass('dts-nav-item--active');
 
		this.$sidebar
			.find(`.dts-nav-item[data-tab="${tab_id}"]`)
			.addClass('dts-nav-item--active');
 
		this.$content
			.find('.dts-panel')
			.removeClass('dts-panel--active');
 
		this.$content
			.find(`#dts-panel-${tab_id}`)
			.addClass('dts-panel--active');

        if (!this._loaded_tabs.has(tab_id)) {
            this.load_tab(tab_id);
        }

    }

    load_tab(tab_id) 
    {
        this._loaded_tabs.add(tab_id);
        const $panel = this.$content.find(`#dts-panel-${tab_id}`);
        const renderer = frappe.doctype_settings.registry[tab_id];

        if(!renderer){
            $panel.html(this.placeholder_html(tab_id));
            return;
        }

        $panel.empty();
        renderer(this.doctype,$panel);

    }

    placeholder_html(tab_id){
        const all_items = frappe.doctype_settings.tabs
            .flatMap(g => g.items);
        const item = all_items.find(i => i.id === tab_id);
        
        const label = item ? __(item.label) : tab_id;

        return `
		<div class="dts-state-view">
			<div class="dts-state-icon">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="1" stroke-linecap="round"
					stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="8" x2="12" y2="12"/>
					<line x1="12" y1="16" x2="12.01" y2="16"/>
				</svg>
			</div>
			<div class="dts-state-title">${__(label)}</div>
			<div class="dts-state-sub">
				${__('No renderer registered for this tab yet.')}
				<br>
				<code>frappe.doctype_settings.register('${tab_id}', fn)</code>
			</div>
		</div>`;
    }


}

