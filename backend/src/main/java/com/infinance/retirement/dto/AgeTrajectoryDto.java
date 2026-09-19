package com.infinance.retirement.dto;

import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;

public record AgeTrajectoryDto(
        int age,
        String phase, // "ACCUMULATION" or "RETIREMENT"
        BigDecimal startingCorpus,
        BigDecimal annualContributionOrWithdrawal,
        BigDecimal interestEarnedYear,
        BigDecimal endingCorpus,
        MoneyAmount startingCorpusFormatted,
        MoneyAmount endingCorpusFormatted
) {}
