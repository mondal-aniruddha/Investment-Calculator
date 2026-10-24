package com.infinance.queries.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Holds the ordered list of team members bound from infinance.team[n].* in application.yml.
 * Provides sensible built-in defaults so the app works without any environment variables.
 */
@Component
@ConfigurationProperties(prefix = "infinance")
public class TeamProperties {

    private List<TeamMemberProperties> team = defaultTeam();

    public List<TeamMemberProperties> getTeam() {
        return team;
    }

    public void setTeam(List<TeamMemberProperties> team) {
        this.team = team;
    }

    // ── Built-in defaults ─────────────────────────────────────────────────────

    private static List<TeamMemberProperties> defaultTeam() {
        List<TeamMemberProperties> list = new ArrayList<>();
        list.add(founder());
        list.add(coFounder());
        return list;
    }

    private static TeamMemberProperties founder() {
        TeamMemberProperties m = new TeamMemberProperties();
        m.setId("aniruddha");
        m.setName("Aniruddha Mondal");
        m.setRole("Founder & Lead Developer");
        m.setShortBio(
            "Aniruddha is a Kolkata-based Java full-stack engineer with around five years of " +
            "experience building Spring Boot microservices and React interfaces for " +
            "financial-services platforms. He built InFinance to make SIP, tax, loan and " +
            "retirement planning simple, transparent and easy to understand for Indian investors. " +
            "He is also pursuing a PGDM in Data Science & Business Analytics."
        );
        m.setWhatsapp("+91 8013292565");
        m.setEmail("aniruddha0266@gmail.com");
        m.setInitials("AM");
        return m;
    }

    private static TeamMemberProperties coFounder() {
        TeamMemberProperties m = new TeamMemberProperties();
        m.setId("kuhika");
        m.setName("Kuhika Das");
        // <CO_FOUNDER_ROLE> — replace the string below with Kuhika's actual role title
        m.setRole("Co-founder");
        // <CO_FOUNDER_BIO> — replace the string below with Kuhika's actual short bio (~50 words)
        m.setShortBio(
            "<CO_FOUNDER_BIO: Replace this placeholder with Kuhika's short biography " +
            "(~50 words). Do not invent qualifications, employers, or achievements. " +
            "Update this default in application.yml via the INFINANCE_TEAM_1_SHORT_BIO env var.>"
        );
        m.setWhatsapp("+91 7667889389");
        m.setEmail("kuhika.das@gmail.com");
        m.setInitials("KD");
        return m;
    }
}
