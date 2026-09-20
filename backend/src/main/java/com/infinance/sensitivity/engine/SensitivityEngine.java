package com.infinance.sensitivity.engine;
import com.infinance.investing.engine.SipEngine;
import com.infinance.sensitivity.dto.*;
import java.math.*;
import java.util.*;
/** Pure what-if analysis that varies return, contribution, and inflation-adjusted purchasing power. */
public final class SensitivityEngine {
    private SensitivityEngine() {}
    public static SensitivityResponse calculate(SensitivityRequest r) {
        BigDecimal base = SipEngine.calculateSingleCorpus(r.monthlyInvestment(), r.years(), r.expectedReturn(), BigDecimal.ZERO).maturityCorpus();
        BigDecimal contributionDelta = r.contributionDelta() == null ? r.monthlyInvestment().multiply(new BigDecimal(".10")) : r.contributionDelta();
        BigDecimal returnDelta = r.returnDelta() == null ? new BigDecimal("2") : r.returnDelta();
        BigDecimal inflationDelta = r.inflationDelta() == null ? new BigDecimal("2") : r.inflationDelta();
        List<SensitivityResponse.Scenario> scenarios = new ArrayList<>();
        add(scenarios, "Contribution", "Higher", SipEngine.calculateSingleCorpus(r.monthlyInvestment().add(contributionDelta), r.years(), r.expectedReturn(), BigDecimal.ZERO).maturityCorpus(), base);
        add(scenarios, "Contribution", "Lower", SipEngine.calculateSingleCorpus(r.monthlyInvestment().subtract(contributionDelta).max(BigDecimal.ZERO), r.years(), r.expectedReturn(), BigDecimal.ZERO).maturityCorpus(), base);
        add(scenarios, "Return", "Higher", SipEngine.calculateSingleCorpus(r.monthlyInvestment(), r.years(), r.expectedReturn().add(returnDelta), BigDecimal.ZERO).maturityCorpus(), base);
        add(scenarios, "Return", "Lower", SipEngine.calculateSingleCorpus(r.monthlyInvestment(), r.years(), r.expectedReturn().subtract(returnDelta).max(BigDecimal.ZERO), BigDecimal.ZERO).maturityCorpus(), base);
        return new SensitivityResponse(base, scenarios, null);
    }
    private static void add(List<SensitivityResponse.Scenario> list, String v, String d, BigDecimal corpus, BigDecimal base) {
        list.add(new SensitivityResponse.Scenario(v, d, corpus, corpus.subtract(base).setScale(2, RoundingMode.HALF_UP)));
    }
}
