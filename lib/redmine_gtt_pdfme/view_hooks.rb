module RedmineGttPdfme
  class ViewHooks < Redmine::Hook::ViewListener

    def view_layouts_base_body_bottom(context={})
      if User.current.allowed_to?(:view_gtt_pdfme, nil, :global => true)
        tags = [];
        tags << javascript_include_tag('../bundle.js', :plugin => 'redmine_gtt_pdfme')
        return tags.join("\n")
      end
    end

  end
end
