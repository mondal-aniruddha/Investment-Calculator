package com.infinance.auth.dto;

import java.util.List;

public record BackupCodesResponse(
    List<String> backupCodes
) {}

