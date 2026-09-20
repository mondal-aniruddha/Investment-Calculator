package com.infinance.networth.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
public record NetWorthRequest(@NotEmpty List<@Valid Item> assets, @NotEmpty List<@Valid Item> liabilities,
                              @NotEmpty List<@Valid Snapshot> history) {
    public record Item(@NotBlank String category, @NotNull @DecimalMin("0") BigDecimal amount) {}
    public record Snapshot(@NotNull LocalDate date, @NotNull BigDecimal netWorth) {}
}
