package com.driveease.user;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "jwt.secret=test-only-driveease-signing-secret-000000000000000000000000",
        "spring.datasource.url=jdbc:h2:mem:user-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "eureka.client.enabled=false"
})
class Ms1UserServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
