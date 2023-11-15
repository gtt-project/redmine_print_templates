class PrintTemplatesController < ApplicationController

  layout ->{ @project ? 'base' : 'admin' }

  self.main_menu = false

  def index
  end

  def edit
  end

  def new
  end

  def create
  end

  def update
  end

  def destroy
  end

  private

end
