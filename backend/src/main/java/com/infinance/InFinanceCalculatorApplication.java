package com.infinance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class InFinanceCalculatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(InFinanceCalculatorApplication.class, args);
    }
}
