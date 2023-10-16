# Global Hooks
require File.expand_path('../lib/redmine_gtt_pdfme/view_hooks', __FILE__)

Redmine::Plugin.register :redmine_gtt_pdfme do
  name 'Redmine GTT pdfme plugin'
  author 'Georepublic'
  author_url 'https://github.com/georepublic'
  url 'https://github.com/gtt-project/redmine_gtt_pdfme'
  description 'Enables printing templates with pdfme in Redmine deployments'
  version '0.1.0'

  requires_redmine :version_or_higher => '5.0.0'

  settings(
    default: {},
    partial: 'gtt_pdfme/settings'
  )

  project_module :gtt_pdfme do
    permission :view_gtt_pdfme, {}, :require => :loggedin
  end

end
