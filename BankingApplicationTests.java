package com.bank;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("h2")
class BankingApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring application context boots and all beans load cleanly
    }
}
