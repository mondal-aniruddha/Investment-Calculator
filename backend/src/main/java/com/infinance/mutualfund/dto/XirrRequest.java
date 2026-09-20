package com.infinance.mutualfund.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record XirrRequest(@NotEmpty List<@Valid CashFlow> cashFlows) {
    public record CashFlow(@NotNull LocalDate date, @NotNull BigDecimal amount) {}
}
