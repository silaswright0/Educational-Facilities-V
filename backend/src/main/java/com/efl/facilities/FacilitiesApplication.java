package com.efl.facilities;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.efl.facilities.models")
@EnableJpaRepositories("com.efl.facilities.repositories")
public class FacilitiesApplication {

    public static void main(final String[] args) {
        SpringApplication.run(FacilitiesApplication.class, args);
    }
}