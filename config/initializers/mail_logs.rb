# Les envois de mail passent par ActionMailer::MailDeliveryJob (deliver_later).
# Par défaut, Active Job écrit les arguments du job dans le log (« Enqueued … with arguments: »),
# sans passer par filter_parameters : nom, e-mail et message des visiteurs y apparaîtraient en clair.
ActiveSupport.on_load(:action_mailer) do
  ActionMailer::MailDeliveryJob.log_arguments = false
end
