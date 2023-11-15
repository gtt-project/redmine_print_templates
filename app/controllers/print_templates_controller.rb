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

  private

  def set_trackers
    @trackers = Tracker.all
  end

  def find_print_template
    @print_template = PrintTemplate.find(params[:id])
  end

  def print_template_params
    params.require(:print_template).permit(:name, :schemas, :inputs, :basepdf, :tracker_id)
  end
end
