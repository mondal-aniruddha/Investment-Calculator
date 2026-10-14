package com.infinance.common.config;

/**
 * Centralized API route constants.
 *
 * All REST controllers and security matchers reference these constants
 * to ensure consistency across the application.
 */
public final class ApiConstants {

    private ApiConstants() {}

    /** Base route for v1 public/authenticated APIs */
    public static final String API_V1 = "/api/v1";

    public static final String AUTH = API_V1 + "/auth";
    public static final String SCENARIOS = API_V1 + "/scenarios";
    public static final String INVESTING = API_V1 + "/investing";
    public static final String MUTUAL_FUNDS = API_V1 + "/mutual-funds";
    public static final String TAX = API_V1 + "/tax";
    public static final String TAX_OPTIMIZER = API_V1 + "/tax/optimizer";
    public static final String RETIREMENT = API_V1 + "/retirement";
    public static final String LOANS = API_V1 + "/loans";
    public static final String FIXED_INCOME = API_V1 + "/fixed-income";
    public static final String GOALS = API_V1 + "/goals";
    public static final String HEALTH_SCORE = API_V1 + "/health-score";
    public static final String NET_WORTH = API_V1 + "/net-worth";
    public static final String SIMULATIONS = API_V1 + "/simulations";
    public static final String ANALYSIS = API_V1 + "/analysis";
    public static final String MARKET = API_V1 + "/market";
    public static final String LEARN = API_V1 + "/learn";
    public static final String GLOSSARY = API_V1 + "/glossary";
    public static final String REPORTS = API_V1 + "/reports";
    public static final String CONFIG = API_V1 + "/config";
    public static final String ADMIN = API_V1 + "/admin";
    public static final String INSIGHTS = API_V1 + "/insights";
}
