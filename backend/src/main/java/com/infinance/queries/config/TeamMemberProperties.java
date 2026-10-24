package com.infinance.queries.config;

/**
 * Holds configuration for a single team member.
 * Bound as elements of infinance.team[n].* list in application.yml.
 */
public class TeamMemberProperties {

    private String id = "";
    private String name = "";
    private String role = "";
    private String shortBio = "";
    /** Raw WhatsApp number, e.g. "+91 8013292565" or "918013292565" */
    private String whatsapp = "";
    private String email = "";
    /** Two-letter initials displayed in avatar circle */
    private String initials = "";

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getShortBio() {
        return shortBio;
    }

    public void setShortBio(String shortBio) {
        this.shortBio = shortBio;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }
}
