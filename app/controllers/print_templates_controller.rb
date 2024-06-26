class PrintTemplatesController < ApplicationController
  layout ->{ @project ? 'base' : 'admin' }

  self.main_menu = false

  before_action :set_trackers, only: [:new, :create, :edit, :update]
  before_action :find_print_template, only: [:edit, :update, :destroy]
  before_action :require_admin, except: [:show, :fields_for_tracker]

  # TODO: make this work with Rails.ajax
  # before_action :authorize_view_print_templates, only: [:show, :fields_for_tracker]

  def index
    @print_templates = PrintTemplate.includes(:tracker).all.order(name: :asc)
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

  def show
    @print_template = PrintTemplate.find(params[:id])
    respond_to do |format|
      format.json { render json: @print_template }
      format.js
    end
  end

  def fields_for_tracker
    @tracker = Tracker.find(params[:tracker_id])

    @core_fields = {
      'author.name' => ['string', l(:field_author)],
      'status.name' => ['string', l(:field_status)],
      'priority.name' => ['string', l(:field_priority)],
      'assigned_to.name' => ['string', l(:field_assigned_to)],
      'category.name' => ['string', l(:field_category)],
      'fixed_version.name' => ['string', l(:field_fixed_version)],
      'subject' => ['string', l(:field_subject)],
      'description' => ['text', l(:field_description)],
      'start_date' => ['date', l(:field_start_date)],
      'due_date' => ['date', l(:field_due_date)],
      'done_ratio' => ['float', l(:field_done_ratio)],
      'estimated_hours' => ['float', l(:field_estimated_hours)],
      'total_estimated_hours' => ['float', l(:field_total_estimated_hours)],
      'spent_hours' => ['float', l(:label_spent_time)],
      'total_spent_hours' => ['float', l(:label_total_spent_time)],
      'created_on' => ['date', l(:field_created_on)],
      'updated_on' => ['date', l(:field_updated_on)],
      'closed_on' => ['date', l(:field_closed_on)],
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    @custom_fields = @tracker.custom_fields.map do |cf|
      field_key = "cf_#{cf.id}"
      field_format = cf.field_format
      field_label = cf.name

      create_field_hash(field_key, field_format, field_label)
    end

    @special_fields = {
      'issue_map' => ['map', l(:field_issue_map)],
      'issue_url' => ['link', l(:field_issue_url)],
    }.map { |field, attributes| create_field_hash(field, *attributes) }

    @core_fields.sort_by! { |field| field[:key].downcase }
    @custom_fields.sort_by! { |field| field[:key].downcase }
    @special_fields.sort_by! { |field| field[:key].downcase }

    render json: {
      coreFields: @core_fields,
      customFields: @custom_fields,
      specialFields: @special_fields
    }
  end

  private

  def create_field_hash(field, format, name_or_key)
    name = I18n.exists?(name_or_key) ? I18n.t(name_or_key) : name_or_key

    {
      label: name,
      key: field,
      format: format
    }
  end

  def set_trackers
    @trackers = Tracker.order(:position)
  end

  def find_print_template
    @print_template = PrintTemplate.find(params[:id])
  end

  def print_template_params
    params.require(:print_template).permit(:name, :schemas, :inputs, :basepdf, :tracker_id)
  end

  def require_admin
    render_403 unless User.current.admin?
  end

  def authorize_view_print_templates
    deny_access unless User.current.allowed_to?(:view_print_templates, @project, global: true)
  end
end
