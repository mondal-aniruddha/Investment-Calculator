package com.infinance.queries.service;

import com.infinance.queries.config.QueryNotificationProperties;
import com.infinance.queries.entity.FinanceQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class QueryNotificationService {

    private static final Logger log = LoggerFactory.getLogger(QueryNotificationService.class);

    private final QueryNotificationProperties properties;
    private final JavaMailSender mailSender;

    public QueryNotificationService(QueryNotificationProperties properties,
                                    @Autowired(required = false) JavaMailSender mailSender) {
        this.properties = properties;
        this.mailSender = mailSender;
    }

    public void notifyOwner(FinanceQuery query) {
        if (!properties.isNotifyEnabled()) {
            log.debug("Email notification for query {} skipped (infinance.queries.notify-enabled=false)",
                    query.getReferenceId());
            return;
        }

        if (mailSender == null) {
            log.warn("Email notification for query {} skipped: JavaMailSender is not configured",
                    query.getReferenceId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(properties.getRecipientEmail());
            message.setSubject("[InFinance] New Query Submitted: " + query.getReferenceId() + " - " + query.getSubject());
            message.setText("A new finance query has been submitted.\n\n"
                    + "Reference ID: " + query.getReferenceId() + "\n"
                    + "Name: " + query.getName() + "\n"
                    + "Email: " + query.getEmail() + "\n"
                    + "Category: " + (query.getCategory() != null ? query.getCategory().getDisplayName() : "") + "\n"
                    + "Preferred Contact: " + query.getPreferredContact() + "\n"
                    + "Subject: " + query.getSubject() + "\n\n"
                    + "Message:\n" + query.getMessage() + "\n");

            mailSender.send(message);
            log.info("Sent owner notification email for query {}", query.getReferenceId());
        } catch (Exception ex) {
            log.error("Failed to send notification email for query {}: {}", query.getReferenceId(), ex.getMessage());
        }
    }
}
