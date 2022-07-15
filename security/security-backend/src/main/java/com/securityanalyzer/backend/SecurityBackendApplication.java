package com.securityanalyzer.backend;

import com.securityanalyzer.backend.util.ApplicationUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class SecurityBackendApplication {

	private static Logger logger = (Logger) LoggerFactory.getLogger(ApplicationUtils.class);

	public static void main(String[] args) {
		SpringApplication.run(SecurityBackendApplication.class, args);
		logger.info("Vulnerabilitiy Analyzer : http://localhost:8080/" );

	}

}
