package com.infinance.investing.dto;

import java.math.BigDecimal;

/**
 * Backward-compatible wrapper for {@link LumpsumRequest} and {@link LumpsumResponse}.
 */
public class LumpsumRequestDto {

    public static class Request extends LumpsumRequest {
        public Request() { super(); }
        public Request(BigDecimal totalInvestment, Integer investmentHorizonYears, BigDecimal expectedAnnualReturn) {
            super(totalInvestment, investmentHorizonYears, expectedAnnualReturn);
        }
    }

    public static class Response extends LumpsumResponse {
        public Response() { super(); }
    }
}
