module RedminePrintTemplates
  class ViewHooks < Redmine::Hook::ViewListener

    def view_layouts_base_body_bottom(context={})
      if User.current.allowed_to?(:view_print_templates, nil, :global => true)
        tags = [];
        tags << javascript_include_tag('print_templates.js', :plugin => 'redmine_print_templates')
        return tags.join("\n")
      end
    end

    render_on :view_layouts_base_html_head, inline: <<-END
      <%= stylesheet_link_tag 'print_templates', plugin: 'redmine_print_templates' %>
    END

    render_on :view_issues_sidebar_issues_bottom, partial: 'print_templates/issue_sidebar'

  end
end
