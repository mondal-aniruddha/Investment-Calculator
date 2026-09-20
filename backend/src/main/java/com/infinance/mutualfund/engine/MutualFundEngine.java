package com.infinance.mutualfund.engine;

import com.infinance.common.money.FinancialMath;
import com.infinance.mutualfund.dto.MutualFundResponse;
import com.infinance.mutualfund.dto.XirrRequest;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Pure mutual-fund tools. SIP/lumpsum use the existing investing engines.
 * SWP applies monthly growth then withdraws the scheduled amount. CAGR is
 * (final / initial)^(1/years)-1. XIRR solves NPV(rate)=0 using Newton-Raphson
 * over actual/365 day fractions.
 */
public final class MutualFundEngine {
    private MutualFundEngine() {}

    public static MutualFundResponse swp(BigDecimal corpus, BigDecimal annualReturn, BigDecimal withdrawal,
            int years, BigDecimal annualIncrease) {
        BigDecimal balance = corpus;
        BigDecimal monthlyRate = FinancialMath.annualPercentToMonthlyRate(annualReturn);
        BigDecimal step = BigDecimal.ONE.add(annualIncrease.divide(FinancialMath.HUNDRED, 12, RoundingMode.HALF_UP));
        BigDecimal currentWithdrawal = withdrawal;
        BigDecimal totalWithdrawn = BigDecimal.ZERO;
        List<MutualFundResponse.ProjectionPoint> points = new ArrayList<>();
        for (int month = 1; month <= years * 12; month++) {
            balance = balance.multiply(BigDecimal.ONE.add(monthlyRate), FinancialMath.MC_CALC)
                    .subtract(currentWithdrawal).max(BigDecimal.ZERO);
            totalWithdrawn = totalWithdrawn.add(currentWithdrawal);
            if (month % 12 == 0) {
                points.add(new MutualFundResponse.ProjectionPoint(month / 12, round(balance), round(totalWithdrawn)));
                currentWithdrawal = currentWithdrawal.multiply(step, FinancialMath.MC_CALC);
            }
            if (balance.compareTo(BigDecimal.ZERO) == 0) break;
        }
        return new MutualFundResponse(round(corpus), round(corpus), BigDecimal.ZERO, round(totalWithdrawn),
                round(balance), round(annualReturn), points, null);
    }

    public static BigDecimal cagr(BigDecimal initial, BigDecimal finalValue, BigDecimal years) {
        double result = Math.pow(finalValue.doubleValue() / initial.doubleValue(), 1d / years.doubleValue()) - 1d;
        return round(BigDecimal.valueOf(result).multiply(FinancialMath.HUNDRED));
    }

    public static BigDecimal xirr(List<XirrRequest.CashFlow> flows) {
        List<XirrRequest.CashFlow> ordered = flows.stream().sorted(Comparator.comparing(XirrRequest.CashFlow::date)).toList();
        var first = ordered.get(0).date();
        double rate = 0.1;
        for (int iteration = 0; iteration < 100; iteration++) {
            double npv = 0d;
            double derivative = 0d;
            for (var flow : ordered) {
                double years = ChronoUnit.DAYS.between(first, flow.date()) / 365d;
                double factor = Math.pow(1d + rate, years);
                npv += flow.amount().doubleValue() / factor;
                derivative -= years * flow.amount().doubleValue() / Math.pow(1d + rate, years + 1d);
            }
            double next = rate - npv / derivative;
            if (Math.abs(next - rate) < 1e-10) return round(BigDecimal.valueOf(next * 100d));
            rate = next;
        }
        return round(BigDecimal.valueOf(rate * 100d));
    }

    private static BigDecimal round(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
}
