package com.infinance.metals.provider;

import com.infinance.metals.dto.MetalsMarketResponseDto;

public interface MetalsDataProvider {

    /**
     * Fetches current metal reference quotes from the underlying market data provider.
     *
     * @return normalized market response DTO containing metal price items
     * @throws com.infinance.metals.exception.MetalsProviderException if retrieval or parsing fails
     */
    MetalsMarketResponseDto fetchLatestRates();

    /**
     * Identifies the provider for logging and telemetry.
     */
    String getProviderName();
}
