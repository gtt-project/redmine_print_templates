class PrintTemplatesController < ApplicationController
  layout ->{ @project ? 'base' : 'admin' }

  self.main_menu = false

  before_action :set_trackers, only: [:new, :create, :edit, :update]
  before_action :find_print_template, only: [:edit, :update, :destroy]

  def index
    @print_templates = PrintTemplate.includes(:tracker).all
  end

  def new
    @print_template = PrintTemplate.new
  end

  def create
    @print_template = PrintTemplate.new(print_template_params)
    if @print_template.save
      redirect_to print_templates_path
    else
      render :new
    end
  end

  def edit
    # @print_template is set by before_action
  end

  def update
    if @print_template.update(print_template_params)
      redirect_to print_templates_path
    else
      render :edit
    end
  end

  def destroy
    if @print_template.destroy
      redirect_to print_templates_path, notice: 'Print template was successfully deleted.'
    else
      redirect_to print_templates_path, alert: 'Failed to delete print template.'
    end
  end

  def fields_for_tracker
    @tracker = Tracker.find(params[:tracker_id])

    # Define core fields and their formats (if known)
    core_fields = {
      'status_id' => 'text',
      'priority_id' => 'text',
      'assigned_to_id' => 'text',
      'category_id' => 'text',
      'fixed_version_id' => 'text',
      'subject' => 'text',
      'description' => 'text',
      'start_date' => 'date',
      'due_date' => 'date'
    }

    @fields = core_fields.map do |field, format|
      field_key = field.end_with?('_id') ? field[0...-3] : field
      {
        name: I18n.t("field_#{field_key}"),
        identifier: field,
        format: format
      }
    end

    # Add custom fields with their specific format
    # TODO: match Redmine format terms with PDFme format terms
    @tracker.custom_fields.each do |cf|
      @fields << {
        name: cf.name,
        identifier: "issue_custom_field_values_#{cf.id}",
        format: cf.field_format
      }
    end

    # Add the special 'geom' field
    @fields << {
      name: I18n.t("field_map"),
      identifier: 'geom',
      format: 'image'
    }

    @fields.sort_by! { |field| field[:name].downcase }

    respond_to do |format|
      format.js
    end
  end

  private

  def set_trackers
    @trackers = Tracker.order(:position)
  end

  def find_print_template
    @print_template = PrintTemplate.find(params[:id])
  end

  def print_template_params
    params.require(:print_template).permit(:name, :schemas, :inputs, :basepdf, :tracker_id)
  end
end
