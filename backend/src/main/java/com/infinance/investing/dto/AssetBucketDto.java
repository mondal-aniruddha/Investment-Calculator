package com.infinance.investing.dto;

import java.util.List;

public record AssetBucketDto(
        String assetClass,
        int percentage,
        String rationale,
        List<String> typicalInstruments
) {}
