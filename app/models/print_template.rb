class PrintTemplate < ActiveRecord::Base
  belongs_to :tracker

  validates :name, presence: true
  validates :name, uniqueness: { scope: :tracker_id }

  validates :tracker_id, presence: true

  # The context of the print template must be one of the following values.
  CONTEXT_OPTIONS = %w(issue issues project).freeze

  validates :context, presence: true, inclusion: { in: CONTEXT_OPTIONS }
end
