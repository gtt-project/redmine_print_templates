# Global Hooks
require File.expand_path('../lib/redmine_gtt_pdfme/view_hooks', __FILE__)

Redmine::Plugin.register :redmine_gtt_pdfme do
  name 'Redmine GTT PDFme plugin'
  author 'Georepublic'
  author_url 'https://github.com/georepublic'
  url 'https://github.com/gtt-project/redmine_gtt_pdfme'
  description 'Enables printing templates with PDFme in Redmine deployments'
  version '0.1.0'

  requires_redmine :version_or_higher => '5.0.0'

  settings(
    default: {},
    partial: 'gtt_pdfme/settings'
  )

  project_module :gtt_pdfme do
    permission :view_gtt_pdfme, {}, :require => :loggedin
  end

  menu :admin_menu, :gtt_pdfme, { controller: 'gtt_pdfme', action: 'index' },
    caption: :label_gtt_pdfme_plural,
    html: { class: 'icon icon-gtt-pdfme' }

end
