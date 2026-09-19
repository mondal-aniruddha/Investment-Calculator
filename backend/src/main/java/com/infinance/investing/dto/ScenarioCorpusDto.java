package com.infinance.investing.dto;

import com.infinance.common.dto.MoneyAmount;

import java.math.BigDecimal;

public record ScenarioCorpusDto(
        String scenarioName,
        BigDecimal returnRatePercent,
        BigDecimal maturityCorpus,
        BigDecimal wealthGain,
        MoneyAmount corpusFormatted,
        MoneyAmount wealthGainFormatted
) {}
