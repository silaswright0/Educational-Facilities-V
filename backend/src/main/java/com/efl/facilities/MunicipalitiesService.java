package com.efl.facilities;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MunicipalitiesService {

    public String getMunicipalitiesGeoJson() throws IOException {
    ClassPathResource resource = new ClassPathResource("data/canadaDistricts.geojson");
    return new String(resource.getInputStream().readAllBytes());
}
}