package com.infinance.simulation.engine;
import com.infinance.simulation.dto.*;
import java.math.*;
import java.util.*;
/** Seedable annual lognormal-style Monte Carlo projection for deterministic tests and reproducible UI runs. */
public final class MonteCarloEngine {
    private MonteCarloEngine() {}
    public static MonteCarloResponse calculate(MonteCarloRequest r) {
        Random random = new Random(r.seed() == null ? 42L : r.seed());
        List<BigDecimal> finals = new ArrayList<>(); List<MonteCarloResponse.BandPoint> bands = new ArrayList<>();
        for (int year = 1; year <= r.years(); year++) {
            List<BigDecimal> values = new ArrayList<>();
            for (int run = 0; run < (r.runs() == null ? 1000 : r.runs()); run++) {
                BigDecimal value = r.initialCorpus();
                for (int y = 0; y < year; y++) {
                    double annual = r.expectedAnnualReturn().doubleValue() / 100d + random.nextGaussian() * r.annualVolatility().doubleValue() / 100d;
                    value = value.add(r.monthlyContribution().multiply(BigDecimal.valueOf(12))).multiply(BigDecimal.valueOf(Math.max(0, 1 + annual)));
                }
                values.add(value);
            }
            values.sort(Comparator.naturalOrder());
            bands.add(new MonteCarloResponse.BandPoint(year, pick(values, .10), pick(values, .50), pick(values, .90)));
            if (year == r.years()) finals.addAll(values);
        }
        long successes = finals.stream().filter(v -> v.compareTo(r.targetCorpus()) >= 0).count();
        return new MonteCarloResponse(r.runs() == null ? 1000 : r.runs(),
                round(BigDecimal.valueOf(successes * 100d / finals.size())), pick(finals, .10), pick(finals, .50), pick(finals, .90), bands, null);
    }
    private static BigDecimal pick(List<BigDecimal> values, double percentile) { return round(values.get((int) Math.min(values.size() - 1, Math.floor(percentile * (values.size() - 1))))); }
    private static BigDecimal round(BigDecimal v) { return v.setScale(2, RoundingMode.HALF_UP); }
}
