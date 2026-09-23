package com.driveease.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Ms1UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(Ms1UserServiceApplication.class, args);
    }
}