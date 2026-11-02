package com.infinance.common.config;

import com.infinance.auth.config.JwtProperties;
import com.infinance.auth.config.OtpProperties;
import com.infinance.common.security.EncryptionProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductionConfigurationValidatorTest {

    private OtpProperties createValidProdOtpProperties() {
        OtpProperties otp = new OtpProperties();
        otp.setProvider("twilio");
        otp.setSecret("valid-production-otp-hmac-secret-at-least-32-chars");
        OtpProperties.TwilioProperties twilio = otp.getTwilio();
        twilio.setAccountSid("ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        twilio.setAuthToken("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
        twilio.setSmsFrom("+15005550006");
        twilio.setWhatsappFrom("+15005550007");
        return otp;
    }

    @Test
    @DisplayName("Fails if JWT secret is dev default in production")
    void failsOnDevJwtSecret() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret(ProductionConfigurationValidator.DEV_JWT_DEFAULT);

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret("super-secret-prod-encryption-key-1234");

        OtpProperties otpProps = createValidProdOtpProperties();

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:mysql://prod-db:3306/infinance");
        env.setProperty("spring.datasource.username", "infinance_app");
        env.setProperty("spring.datasource.password", "secure-db-password-123");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insecure development JWT secret");
    }

    @Test
    @DisplayName("Fails if encryption secret is dev default in production")
    void failsOnDevEncryptionSecret() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("valid-production-jwt-secret-key-at-least-32-chars-long");

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret(ProductionConfigurationValidator.DEV_ENCRYPTION_DEFAULT_1);

        OtpProperties otpProps = createValidProdOtpProperties();

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:mysql://prod-db:3306/infinance");
        env.setProperty("spring.datasource.username", "infinance_app");
        env.setProperty("spring.datasource.password", "secure-db-password-123");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insecure development encryption secret");
    }

    @Test
    @DisplayName("Fails if database is missing or H2 in production")
    void failsOnDevDatabase() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("valid-production-jwt-secret-key-at-least-32-chars-long");

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret("super-secret-prod-encryption-key-1234");

        OtpProperties otpProps = createValidProdOtpProperties();

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:h2:mem:test");
        env.setProperty("spring.datasource.username", "sa");
        env.setProperty("spring.datasource.password", "");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Production database URL");
    }

    @Test
    @DisplayName("Fails if OTP provider is dev in production profile")
    void failsOnDevOtpProvider() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("valid-production-jwt-secret-key-at-least-32-chars-long");

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret("super-secret-prod-encryption-key-1234");

        OtpProperties otpProps = createValidProdOtpProperties();
        otpProps.setProvider("dev");

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:mysql://prod-db:3306/infinance");
        env.setProperty("spring.datasource.username", "infinance_app");
        env.setProperty("spring.datasource.password", "secure-db-password-123");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insecure development OTP provider ('dev')");
    }

    @Test
    @DisplayName("Fails if OTP secret is dev default or too short in production")
    void failsOnDevOtpSecret() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("valid-production-jwt-secret-key-at-least-32-chars-long");

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret("super-secret-prod-encryption-key-1234");

        OtpProperties otpProps = createValidProdOtpProperties();
        otpProps.setSecret(OtpProperties.DEV_SECRET_DEFAULT);

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:mysql://prod-db:3306/infinance");
        env.setProperty("spring.datasource.username", "infinance_app");
        env.setProperty("spring.datasource.password", "secure-db-password-123");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insecure development OTP secret");
    }

    @Test
    @DisplayName("Fails if Twilio credentials are missing in production")
    void failsOnMissingTwilioCredentials() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("valid-production-jwt-secret-key-at-least-32-chars-long");

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret("super-secret-prod-encryption-key-1234");

        OtpProperties otpProps = createValidProdOtpProperties();
        otpProps.getTwilio().setAccountSid("");

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:mysql://prod-db:3306/infinance");
        env.setProperty("spring.datasource.username", "infinance_app");
        env.setProperty("spring.datasource.password", "secure-db-password-123");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatThrownBy(validator::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Twilio credentials and senders");
    }

    @Test
    @DisplayName("Passes when all production configurations are valid and secure")
    void passesOnValidProductionConfig() {
        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("valid-production-jwt-secret-key-at-least-32-chars-long");

        EncryptionProperties encProps = new EncryptionProperties();
        encProps.setSecret("super-secret-prod-encryption-key-1234");

        OtpProperties otpProps = createValidProdOtpProperties();

        MockEnvironment env = new MockEnvironment();
        env.setProperty("spring.datasource.url", "jdbc:mysql://prod-db:3306/infinance");
        env.setProperty("spring.datasource.username", "infinance_app");
        env.setProperty("spring.datasource.password", "secure-db-password-123");

        ProductionConfigurationValidator validator = new ProductionConfigurationValidator(jwtProps, encProps, otpProps, env);

        assertThatCode(validator::validate).doesNotThrowAnyException();
    }
}
