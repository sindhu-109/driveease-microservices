package com.driveease.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import java.util.Set;
import java.util.stream.Collectors;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class MsApiGatewayApplicationTests {
	@Autowired
	private RouteLocator routeLocator;

	@Test
	void contextLoads() {
	}

	@Test
	void gatewayRegistersAllServiceRoutes() {
		Set<String> routeIds = routeLocator.getRoutes().map(route -> route.getId())
				.collectList().block().stream().collect(Collectors.toSet());
		assertTrue(routeIds.containsAll(Set.of("USER-SERVICE", "VEHICLE-SERVICE", "BOOKING-SERVICE")));
	}

}
