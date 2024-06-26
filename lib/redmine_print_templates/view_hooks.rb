module RedminePrintTemplates
  class ViewHooks < Redmine::Hook::ViewListener

    def view_layouts_base_body_bottom(context={})
      tags = []
      controller = context[:controller]

      # Load specific JS for admin in print_templates menu
      if User.current.admin? && controller.controller_name == 'print_templates' && ['index', 'new', 'edit'].include?(controller.action_name)
        tags << javascript_include_tag('print_templates_designer.js', plugin: 'redmine_print_templates')

      # Load print_templates_font.js in plugin settings
      elsif User.current.admin? && controller.controller_name == 'settings' && controller.action_name == 'plugin' && controller.params[:id] == 'redmine_print_templates'
        tags << javascript_include_tag('print_templates_font.js', plugin: 'redmine_print_templates')

      # Load viewer JS only if designer JS is not loaded
      elsif User.current.allowed_to?(:view_print_templates, context[:project], global: true)
        tags << javascript_include_tag('print_templates_viewer.js', plugin: 'redmine_print_templates')
      end

      tags.join("\n")
    end

    render_on :view_layouts_base_html_head, inline: <<-END
      <%= stylesheet_link_tag 'print_templates', plugin: 'redmine_print_templates' %>
    END

    render_on :view_issues_sidebar_issues_bottom, partial: 'print_templates/issue_sidebar'

    def view_layouts_base_html_head(context={})
      if User.current.admin? || User.current.allowed_to?(:view_print_templates, context[:project], global: true)
        return stylesheet_link_tag('print_templates', plugin: 'redmine_print_templates')
      end
    end

    def view_issues_sidebar_issues_bottom(context={})
      return '' unless context[:project] && User.current.allowed_to?(:view_print_templates, context[:project])

      issue = context[:issue]
      project = context[:project]
      print_templates = PrintTemplate.where(tracker_id: project.trackers.pluck(:id))
      return '' if print_templates.empty?

      context[:controller].send(:render_to_string, {
        partial: 'print_templates/issue_sidebar',
        locals: { print_templates: print_templates, project: project, issue: issue }
      })
    end

  end
end
