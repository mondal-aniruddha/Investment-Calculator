package com.infinance.queries.entity;

public enum QueryCategory {
    SIP_MUTUAL_FUNDS("SIP / Mutual Funds"),
    LUMPSUM("Lumpsum"),
    RETIREMENT_PLANNING("Retirement Planning"),
    INCOME_TAX("Income Tax"),
    LOANS_EMI("Loans / EMI"),
    FIXED_INCOME("Fixed Income (FD/RD/PPF/EPF/NPS/SSY)"),
    GOALS_NET_WORTH("Goals / Net Worth"),
    OTHER("Other");

    private final String displayName;

    QueryCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
