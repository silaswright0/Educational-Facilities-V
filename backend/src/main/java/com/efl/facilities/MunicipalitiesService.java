package com.efl.facilities;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class MunicipalitiesService {

    public Resource getMunicipalitiesGeoJson() {
        // Return the classpath resource so Spring can stream it without loading the whole file into memory
        return new ClassPathResource("data/canadaDistricts.geojson");
    }
}
