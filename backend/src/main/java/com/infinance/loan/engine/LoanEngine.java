package com.infinance.loan.engine;

import com.infinance.common.money.FinancialMath;
import com.infinance.loan.dto.LoanCalculationResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure loan calculations.
 *
 * <p>EMI = P*r*(1+r)^n / ((1+r)^n - 1), where P is principal,
 * r is the monthly rate (annual percentage / 1200), and n is months.
 * Each amortization month applies interest to the opening balance and
 * allocates the remainder of EMI to principal.</p>
 */
public final class LoanEngine {
    private LoanEngine() {}

    public static LoanCalculationResponse calculateEmi(BigDecimal principal, int years, BigDecimal annualRate) {
        int months = years * 12;
        BigDecimal emi = emi(principal, months, annualRate);
        List<LoanCalculationResponse.LoanSchedulePoint> schedule = schedule(principal, months, annualRate, emi);
        BigDecimal total = emi.multiply(BigDecimal.valueOf(months));
        return response(emi, total.subtract(principal), total, months, null, null, null, null, null, schedule);
    }

    public static LoanCalculationResponse calculatePrepayment(
            BigDecimal principal, int years, BigDecimal annualRate, int paymentMonth, BigDecimal partPayment) {
        int months = years * 12;
        BigDecimal originalEmi = emi(principal, months, annualRate);
        BigDecimal balance = balanceAfter(principal, months, annualRate, originalEmi, paymentMonth);
        BigDecimal afterPayment = balance.subtract(partPayment).max(BigDecimal.ZERO);
        int revisedMonths = monthsRemaining(afterPayment, originalEmi, annualRate);
        BigDecimal revisedEmi = emi(afterPayment, months - paymentMonth, annualRate);
        BigDecimal oldInterest = originalEmi.multiply(BigDecimal.valueOf(months)).subtract(principal);
        BigDecimal newInterest = originalEmi.multiply(BigDecimal.valueOf(paymentMonth))
                .add(revisedEmi.multiply(BigDecimal.valueOf(months - paymentMonth)))
                .add(partPayment).subtract(principal);
        return response(originalEmi, oldInterest, originalEmi.multiply(BigDecimal.valueOf(months)), months,
                revisedEmi, revisedMonths, oldInterest.subtract(newInterest).max(BigDecimal.ZERO),
                null, null, schedule(principal, months, annualRate, originalEmi));
    }

    public static LoanCalculationResponse compareSurplus(
            BigDecimal principal, int years, BigDecimal annualRate, int paymentMonth,
            BigDecimal partPayment, BigDecimal monthlySurplus, BigDecimal sipReturn) {
        LoanCalculationResponse prepayment = calculatePrepayment(principal, years, annualRate, paymentMonth, partPayment);
        BigDecimal corpus = sipFutureValue(monthlySurplus, years, sipReturn);
        return new LoanCalculationResponse(prepayment.emi(), prepayment.totalInterest(), prepayment.totalPayment(),
                prepayment.tenureMonths(), prepayment.revisedEmi(), prepayment.revisedTenureMonths(),
                prepayment.interestSaved(), corpus, corpus.subtract(prepayment.interestSaved()),
                prepayment.schedule(), prepayment.assumptions());
    }

    public static LoanCalculationResponse balanceTransfer(
            BigDecimal outstanding, int years, BigDecimal currentRate, BigDecimal newRate, BigDecimal feePercent) {
        int months = years * 12;
        BigDecimal oldEmi = emi(outstanding, months, currentRate);
        BigDecimal newEmi = emi(outstanding, months, newRate);
        BigDecimal oldInterest = oldEmi.multiply(BigDecimal.valueOf(months)).subtract(outstanding);
        BigDecimal fee = outstanding.multiply(feePercent).divide(FinancialMath.HUNDRED, 12, RoundingMode.HALF_UP);
        BigDecimal newInterest = newEmi.multiply(BigDecimal.valueOf(months)).subtract(outstanding).add(fee);
        return response(oldEmi, oldInterest, oldEmi.multiply(BigDecimal.valueOf(months)), months, newEmi, months,
                oldInterest.subtract(newInterest), null, null, schedule(outstanding, months, newRate, newEmi));
    }

    public static LoanCalculationResponse floatingRate(
            BigDecimal principal, int years, BigDecimal currentRate, BigDecimal simulatedRate) {
        int months = years * 12;
        BigDecimal currentEmi = emi(principal, months, currentRate);
        BigDecimal simulatedEmi = emi(principal, months, simulatedRate);
        BigDecimal currentInterest = currentEmi.multiply(BigDecimal.valueOf(months)).subtract(principal);
        BigDecimal simulatedInterest = simulatedEmi.multiply(BigDecimal.valueOf(months)).subtract(principal);
        return response(currentEmi, currentInterest, currentEmi.multiply(BigDecimal.valueOf(months)), months,
                simulatedEmi, months, currentInterest.subtract(simulatedInterest), null, null,
                schedule(principal, months, simulatedRate, simulatedEmi));
    }

    public static BigDecimal emi(BigDecimal principal, int months, BigDecimal annualRate) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return round(principal.divide(BigDecimal.valueOf(months), 12, RoundingMode.HALF_UP));
        }
        BigDecimal r = FinancialMath.annualPercentToMonthlyRate(annualRate);
        BigDecimal factor = BigDecimal.ONE.add(r).pow(months, FinancialMath.MC_CALC);
        return round(principal.multiply(r).multiply(factor)
                .divide(factor.subtract(BigDecimal.ONE), FinancialMath.MC_CALC));
    }

    private static BigDecimal balanceAfter(BigDecimal principal, int months, BigDecimal rate, BigDecimal emi, int month) {
        BigDecimal balance = principal;
        BigDecimal monthlyRate = FinancialMath.annualPercentToMonthlyRate(rate);
        for (int i = 1; i <= month; i++) {
            BigDecimal interest = balance.multiply(monthlyRate, FinancialMath.MC_CALC);
            balance = balance.add(interest).subtract(emi).max(BigDecimal.ZERO);
        }
        return balance;
    }

    private static int monthsRemaining(BigDecimal balance, BigDecimal payment, BigDecimal rate) {
        if (balance.compareTo(BigDecimal.ZERO) <= 0) return 0;
        int months = 0;
        BigDecimal monthlyRate = FinancialMath.annualPercentToMonthlyRate(rate);
        while (balance.compareTo(BigDecimal.ZERO) > 0 && months < 600) {
            balance = balance.add(balance.multiply(monthlyRate, FinancialMath.MC_CALC)).subtract(payment);
            months++;
        }
        return months;
    }

    private static List<LoanCalculationResponse.LoanSchedulePoint> schedule(
            BigDecimal principal, int months, BigDecimal rate, BigDecimal payment) {
        List<LoanCalculationResponse.LoanSchedulePoint> points = new ArrayList<>();
        BigDecimal balance = principal;
        BigDecimal monthlyRate = FinancialMath.annualPercentToMonthlyRate(rate);
        BigDecimal cumulativeInterest = BigDecimal.ZERO;
        for (int i = 1; i <= months && balance.compareTo(BigDecimal.ZERO) > 0; i++) {
            BigDecimal interest = balance.multiply(monthlyRate, FinancialMath.MC_CALC);
            cumulativeInterest = cumulativeInterest.add(interest);
            balance = balance.add(interest).subtract(payment).max(BigDecimal.ZERO);
            points.add(new LoanCalculationResponse.LoanSchedulePoint(i, round(balance), round(cumulativeInterest)));
        }
        return points;
    }

    private static BigDecimal sipFutureValue(BigDecimal monthly, int years, BigDecimal annualRate) {
        int months = years * 12;
        BigDecimal r = FinancialMath.annualPercentToMonthlyRate(annualRate);
        if (r.compareTo(BigDecimal.ZERO) == 0) return round(monthly.multiply(BigDecimal.valueOf(months)));
        BigDecimal factor = BigDecimal.ONE.add(r).pow(months, FinancialMath.MC_CALC);
        return round(monthly.multiply(factor.subtract(BigDecimal.ONE)).divide(r, FinancialMath.MC_CALC)
                .multiply(BigDecimal.ONE.add(r)));
    }

    private static LoanCalculationResponse response(BigDecimal emi, BigDecimal interest, BigDecimal total, int months,
            BigDecimal revisedEmi, Integer revisedMonths, BigDecimal saved, BigDecimal corpus, BigDecimal net,
            List<LoanCalculationResponse.LoanSchedulePoint> schedule) {
        return new LoanCalculationResponse(round(emi), round(interest), round(total), months,
                revisedEmi == null ? null : round(revisedEmi), revisedMonths, saved == null ? null : round(saved),
                corpus == null ? null : round(corpus), net == null ? null : round(net), schedule, null);
    }

    private static BigDecimal round(BigDecimal value) {
        return value.setScale(FinancialMath.MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
