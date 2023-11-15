# Global Hooks
require File.expand_path('../lib/redmine_print_templates/view_hooks', __FILE__)

Redmine::Plugin.register :redmine_print_templates do
  name 'Redmine Print Templates plugin'
  author 'Georepublic'
  author_url 'https://github.com/georepublic'
  url 'https://github.com/gtt-project/redmine_print_templates'
  description 'Enables printing templates with PDFme in Redmine deployments'
  version '0.2.0'

  requires_redmine :version_or_higher => '5.0.0'

  settings(
    default: {},
    partial: 'print_templates/settings'
  )

  project_module :print_templates do
    permission :view_print_templates, {}, :require => :loggedin
  end

  menu :admin_menu, :print_templates, { controller: 'print_templates', action: 'index' },
    caption: :label_print_templates_plural,
    html: { class: 'icon icon-print-templates' }

end
